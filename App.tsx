
import React, { useState, useCallback } from 'react';
import { analyzeChart } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import ImageUploader from './components/ImageUploader';
import TextInput from './components/TextInput';
import AnalysisResult from './components/AnalysisResult';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [pairName, setPairName] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('');
  const [chartImage, setChartImage] = useState<File | null>(null);
  const [chartImagePreview, setChartImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setChartImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setChartImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setChartImage(null);
      setChartImagePreview(null);
    }
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!chartImage || !pairName || !timeframe) {
      setError('Please provide a chart image, pair name, and timeframe.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const { base64, mimeType } = await fileToBase64(chartImage);
      const result = await analyzeChart(base64, mimeType, pairName, timeframe);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [chartImage, pairName, timeframe]);

  const isButtonDisabled = !chartImage || !pairName || !timeframe || isLoading;

  return (
    <div className="bg-slate-900 min-h-screen text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            AI Financial Chart Analyst
          </h1>
          <p className="mt-2 text-slate-400">
            Upload a financial chart and get an instant AI-powered technical analysis.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 p-6 rounded-lg shadow-2xl border border-slate-700">
            <h2 className="text-2xl font-semibold mb-6 text-cyan-400 border-b border-slate-700 pb-3">
              1. Provide Chart Details
            </h2>
            <div className="space-y-6">
              <ImageUploader
                onImageChange={handleImageChange}
                previewUrl={chartImagePreview}
              />
              <TextInput
                id="pairName"
                label="Pair Name"
                value={pairName}
                onChange={(e) => setPairName(e.target.value)}
                placeholder="e.g., BTC/USD"
              />
              <TextInput
                id="timeframe"
                label="Timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                placeholder="e.g., H4, D1, W1"
              />
              <button
                onClick={handleAnalyzeClick}
                disabled={isButtonDisabled}
                className="w-full flex justify-center items-center gap-2 bg-cyan-500 text-slate-900 font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {isLoading ? (
                  <>
                    <Loader />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Chart'
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-2xl border border-slate-700">
            <h2 className="text-2xl font-semibold mb-6 text-cyan-400 border-b border-slate-700 pb-3">
              2. Analysis Result
            </h2>
            <div className="min-h-[400px] flex flex-col justify-center">
              {isLoading && (
                 <div className="flex flex-col items-center justify-center text-slate-400">
                    <Loader size="h-10 w-10"/>
                    <p className="mt-4 text-lg">AI is analyzing the chart...</p>
                    <p className="text-sm">This may take a moment.</p>
                 </div>
              )}
              {error && (
                <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg">
                  <h3 className="font-bold text-lg">Error</h3>
                  <p>{error}</p>
                </div>
              )}
              {analysisResult && <AnalysisResult result={analysisResult} />}
              {!isLoading && !error && !analysisResult && (
                <div className="text-center text-slate-500">
                  <p>Your analysis report will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
