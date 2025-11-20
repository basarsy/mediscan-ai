from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Load the model
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'skin_cancer_model.h5')
model = None

def load_model():
    """Load the skin cancer detection model"""
    global model
    if model is None:
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"Model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    return model

def preprocess_image(image_file):
    """
    Preprocess image for model input
    - Resize to 224x224 (MobileNet input size)
    - Convert to RGB
    - Normalize to [0, 1]
    - Add batch dimension
    """
    try:
        # Reset file pointer to beginning in case it was read before
        image_file.seek(0)
        
        # Open and convert image
        image = Image.open(io.BytesIO(image_file.read()))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to 224x224
        image = image.resize((224, 224))
        
        # Convert to numpy array and normalize
        img_array = np.array(image) / 255.0
        
        # Add batch dimension: (224, 224, 3) -> (1, 224, 224, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "model_loaded": model is not None})

@app.route('/predict', methods=['POST'])
def predict():
    """Predict endpoint for skin cancer detection"""
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({"error": "No image file selected"}), 400
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'}
        if not ('.' in image_file.filename and 
                image_file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({"error": "Invalid file type. Only PNG, JPG, JPEG are allowed"}), 400
        
        # Load model if not already loaded
        model = load_model()
        
        # Preprocess image
        processed_image = preprocess_image(image_file)
        
        # Make prediction
        predictions = model.predict(processed_image, verbose=0)
        
        # DEBUG: Log raw model output
        print(f"\n=== MODEL OUTPUT DEBUG ===")
        print(f"Predictions shape: {predictions.shape}")
        print(f"Predictions type: {type(predictions)}")
        print(f"Raw predictions array: {predictions}")
        print(f"Predictions[0]: {predictions[0]}")
        print(f"Predictions sum (should be ~1.0 for softmax): {np.sum(predictions[0])}")
        
        # Get the predicted class and confidence
        # The model outputs probabilities for 7 classes (HAM10000 dataset):
        # 0: akiec (Actinic keratoses - potentially cancerous)
        # 1: bcc (Basal cell carcinoma - cancerous)
        # 2: bkl (Benign keratosis - benign)
        # 3: df (Dermatofibroma - benign)
        # 4: mel (Melanoma - cancerous)
        # 5: nv (Melanocytic nevi - benign)
        # 6: vasc (Vascular lesions - benign)
        
        # Cancerous classes: akiec (0), bcc (1), mel (4)
        # Benign classes: bkl (2), df (3), nv (5), vasc (6)
        cancerous_classes = [0, 1, 4]  # akiec, bcc, mel
        
        predicted_class = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class] * 100)
        
        print(f"Predicted class index: {predicted_class}")
        print(f"Confidence: {confidence}%")
        print(f"===========================\n")
        
        # Determine if cancer is detected
        detected = predicted_class in cancerous_classes
        
        # Get class name
        class_names = ['Actinic keratoses', 'Basal cell carcinoma', 'Benign keratosis', 
                      'Dermatofibroma', 'Melanoma', 'Melanocytic nevi', 'Vascular lesions']
        class_name = class_names[predicted_class]
        
        # Build response
        response_data = {
            "detected": bool(detected),
            "confidence": round(confidence, 2),
            "class_index": int(predicted_class),
            "class_name": class_name,
            "all_predictions": {
                class_names[i]: round(float(predictions[0][i] * 100), 2) 
                for i in range(len(class_names))
            }
        }
        
        # DEBUG: Log response being sent
        print(f"=== API RESPONSE ===")
        print(f"Response data: {response_data}")
        print(f"===================\n")
        
        return jsonify(response_data)
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

if __name__ == '__main__':
    # Load model on startup
    print("Loading model...")
    try:
        load_model()
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Warning: Could not load model on startup: {e}")
        print("Model will be loaded on first prediction request")
    
    # Run the server
    app.run(host='0.0.0.0', port=5000, debug=True)

