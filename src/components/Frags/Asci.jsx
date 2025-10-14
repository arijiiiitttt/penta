import React, { useState, useRef } from 'react';
import { Download, Copy, Sun, Moon, Upload } from 'lucide-react';

const ASCII_CHARS = ['@', '#', 'S', '%', '?', '*', '+', ';', ':', ',', '.', ' '];

function Asci() {
  const canvasRef = useRef(null);
  const outputRef = useRef(null);
  const [asciiArt, setAsciiArt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [copyStatus, setCopyStatus] = useState('Copy');

  const processImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // Optimal size for messaging apps
          const maxWidth = 60;
          const aspectRatio = img.height / img.width;
          const width = Math.min(maxWidth, img.width);
          const height = Math.floor(width * aspectRatio * 0.4); // Adjust for character height
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height).data;
          
          let ascii = '';
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const index = (y * width + x) * 4;
              const r = imageData[index];
              const g = imageData[index + 1];
              const b = imageData[index + 2];
              
              // Convert to grayscale using luminance formula
              const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
              const charIndex = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
              ascii += ASCII_CHARS[charIndex];
            }
            ascii += '\n';
          }
          
          resolve(ascii);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setCopyStatus('Copy');
    
    try {
      const result = await processImage(file);
      setAsciiArt(result);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!asciiArt) return;
    
    try {
      await navigator.clipboard.writeText(asciiArt);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    } catch (error) {
      setCopyStatus('Failed');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    }
  };

  const downloadAsImage = () => {
    if (!outputRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const fontSize = 8;
    const lineHeight = fontSize * 0.8;
    const lines = asciiArt.split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));
    
    canvas.width = maxLineLength * fontSize * 0.6;
    canvas.height = lines.length * lineHeight;
    
    // Set background
    ctx.fillStyle = isDarkMode ? '#111827' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set text style
    ctx.fillStyle = isDarkMode ? '#22c55e' : '#1f2937';
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';
    
    // Draw text
    lines.forEach((line, index) => {
      ctx.fillText(line, 0, index * lineHeight);
    });
    
    // Download
    const link = document.createElement('a');
    link.download = 'ascii-art.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const toggleMode = () => setIsDarkMode(!isDarkMode);

  return (
    <>
    <div className={`min-h-screen p-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleMode}
        className={`fixed top-4 right-4 p-2 rounded-full transition-colors z-10 ${
          isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600 shadow-md'
        }`}
      >
        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl Galter font-bold mb-3">ASCII Art Generator</h1>
          <p className={`text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Convert images to text art perfect for sharing
          </p>
        </div>

        {/* Main Card */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Upload Section */}
          <div className="p-6">
            <label className={`block w-full cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDarkMode 
                ? 'border-gray-600 hover:border-gray-500 bg-gray-900/50' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}>
              <Upload className={`mx-auto mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} size={32} />
              <span className="block text-sm font-medium mb-1">Click to upload image</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                PNG, JPG, GIF up to 10MB
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="px-6 pb-6">
              <div className={`rounded-lg p-6 text-center ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
              }`}>
                <div className="animate-spin mx-auto mb-3 w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Converting your image...
                </p>
              </div>
            </div>
          )}
          {/* Output Section */}
          {asciiArt && (
            <div className="border-t border-gray-700">
              {/* Controls */}
              <div className={`flex flex-wrap gap-2 p-3 border-b ${
                isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <span className={`text-xs flex-1 self-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Works best in monospace fonts
                </span>
                <button
                  onClick={downloadAsImage}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <Download size={12} />
                  Image
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <Copy size={12} />
                  {copyStatus}
                </button>
              </div>

              {/* ASCII Output */}
              <div className={`overflow-auto ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
              }`}>
                <pre
                  ref={outputRef}
                  className={`p-4 text-xs md:text-sm font-mono leading-tight whitespace-pre ${
                    isDarkMode ? 'text-green-400' : 'text-gray-800'
                  }`}
                  style={{ maxHeight: '400px' }}
                >
                  {asciiArt}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        {asciiArt && (
          <div className={`mt-4 p-4 rounded-lg text-sm ${
            isDarkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-blue-50 text-gray-600'
          }`}>
            <h3 className="font-medium mb-2">Sharing Tips:</h3>
            <ul className="space-y-1 text-xs">
              <li>• For best results, download as image</li>
              <li>• Text may look distorted in some messaging apps</li>
              <li>• Works perfectly in code editors and terminals</li>
            </ul>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    
    </div>
    
    </>
  );
}

export default Asci;