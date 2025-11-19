import { useState } from "react";
import { Header } from "@/components/Header";
import { ImageUpload } from "@/components/ImageUpload";
import { AnalysisResults } from "@/components/AnalysisResults";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Microscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{ detected: boolean; confidence: number } | null>(null);
  const { toast } = useToast();

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setResults(null);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setResults(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    
    // Simulate API call - Replace this with actual backend integration
    try {
      // Mock analysis delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock results - Replace with actual API response
      const mockResults = {
        detected: Math.random() > 0.5,
        confidence: Math.floor(Math.random() * 30) + 70,
      };
      
      setResults(mockResults);
      
      toast({
        title: "Analysis Complete",
        description: "The image has been successfully analyzed.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <h2 className="text-4xl font-bold tracking-tight">
              AI-Powered Cancer Detection
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload medical images for instant AI analysis. Our advanced system helps identify potential cancer cells with high accuracy.
            </p>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <ImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              onClear={handleClear}
            />
            
            {selectedImage && !results && (
              <div className="flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Microscope className="mr-2 h-5 w-5" />
                      Analyze Image
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Results Section */}
          {results && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <AnalysisResults detected={results.detected} confidence={results.confidence} />
              <div className="flex justify-center">
                <Button variant="outline" onClick={handleClear}>
                  Analyze Another Image
                </Button>
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <Card className="p-6 space-y-2">
              <div className="text-primary font-semibold text-lg">Fast Analysis</div>
              <p className="text-sm text-muted-foreground">
                Get results in seconds using advanced AI algorithms
              </p>
            </Card>
            <Card className="p-6 space-y-2">
              <div className="text-primary font-semibold text-lg">High Accuracy</div>
              <p className="text-sm text-muted-foreground">
                Powered by state-of-the-art machine learning models
              </p>
            </Card>
            <Card className="p-6 space-y-2">
              <div className="text-primary font-semibold text-lg">Secure & Private</div>
              <p className="text-sm text-muted-foreground">
                Your medical data is handled with the highest security standards
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
