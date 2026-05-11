import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function UploadZone({ onUpload, isLoading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      onUpload(file);
    }
  }, [onUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      onUpload(file);
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  }, [onUpload]);

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        id="drop-zone"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !preview && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-500 flex flex-col items-center justify-center min-h-[350px] cursor-pointer group
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-[1.01] shadow-[0_0_50px_-12px_rgba(37,99,235,0.2)]' 
            : 'border-border hover:border-primary/40 bg-card/40 backdrop-blur-md shadow-xl'
          }
          ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <div className="absolute inset-0 tech-grid opacity-5 group-hover:opacity-10 transition-opacity" />
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileInput}
          accept="image/*"
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full h-full flex flex-col items-center z-20"
            >
              <div className="relative group/image">
                <img
                  src={preview}
                  alt="Trade Preview"
                  className="max-h-[250px] rounded-2xl border-4 border-background shadow-2xl mb-8 bg-background object-contain transition-transform group-hover/image:scale-105 duration-500"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearPreview();
                }}
                className="absolute -top-6 -right-6 bg-destructive text-destructive-foreground p-2.5 rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl z-30"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="px-6 py-2.5 bg-foreground text-background rounded-full text-[10px] font-black tracking-[0.2em] flex items-center gap-3 uppercase shadow-lg">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Neural Processing...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 text-primary" />
                    Extraction Ready • Active
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center relative z-20"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 mx-auto mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
                <Upload className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tight mb-4">Transmit Intelligence</h3>
              <p className="text-muted-foreground max-w-sm mx-auto text-[15px] font-medium leading-relaxed mb-10">
                Drop your chart or order book here. Our neural engine will extract confluence in real-time.
              </p>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground text-sm font-black rounded-2xl hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 uppercase tracking-widest"
              >
                Browse Files
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
