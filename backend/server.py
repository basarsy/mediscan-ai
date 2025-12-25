from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

# Model path
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'skin_cancer_model.h5')
model = None

def load_model():
    """Load the skin cancer detection model"""
    global model
    if model is None:
        print(f"\n{'='*50}")
        print("LOADING SKIN CANCER DETECTION MODEL")
        print(f"{'='*50}")
        print(f"Model path: {MODEL_PATH}")
        
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
        
        model = tf.keras.models.load_model(MODEL_PATH)
        
        print(f"✓ MODEL LOADED")
        print(f"Input shape: {model.input_shape}")
        print(f"Output shape: {model.output_shape}")
        print(f"{'='*50}\n")
    return model

def preprocess_image(image_file):
    """Preprocess image for ResNet50 model input (224x224, ResNet preprocessing)"""
    from tensorflow.keras.applications.resnet50 import preprocess_input
    
    image_file.seek(0)
    image = Image.open(io.BytesIO(image_file.read()))
    
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    image = image.resize((224, 224), Image.LANCZOS)
    img_array = np.array(image).astype(np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    
    # Apply ResNet50 preprocessing (ImageNet mean subtraction)
    img_array = preprocess_input(img_array)
    
    print(f"Preprocessed: shape={img_array.shape}, range=[{img_array.min():.1f}, {img_array.max():.1f}]")
    return img_array

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "model_loaded": model is not None})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No image file selected"}), 400
        
        allowed = {'png', 'jpg', 'jpeg'}
        if '.' not in image_file.filename or image_file.filename.rsplit('.', 1)[1].lower() not in allowed:
            return jsonify({"error": "Invalid file type"}), 400
        
        model = load_model()
        processed_image = preprocess_image(image_file)
        predictions = model.predict(processed_image, verbose=0)
        
        class_names = ['Actinic keratoses', 'Basal cell carcinoma', 'Benign keratosis', 
                      'Dermatofibroma', 'Melanoma', 'Melanocytic nevi', 'Vascular lesions']
        cancerous_classes = [0, 1, 4]
        
        predicted_class = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class] * 100)
        detected = predicted_class in cancerous_classes
        class_name = class_names[predicted_class]
        
        print(f"Prediction: {class_name} ({confidence:.1f}%) - Cancer: {detected}")
        
        return jsonify({
            "detected": bool(detected),
            "confidence": round(confidence, 2),
            "class_index": int(predicted_class),
            "class_name": class_name,
            "all_predictions": {
                class_names[i]: round(float(predictions[0][i] * 100), 2) 
                for i in range(len(class_names))
            }
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting MediScan AI Backend...")
    try:
        load_model()
    except Exception as e:
        print(f"Warning: {e}")
    app.run(host='0.0.0.0', port=5000, debug=True)
