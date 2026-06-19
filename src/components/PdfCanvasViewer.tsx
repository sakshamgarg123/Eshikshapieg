import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, FileText, Loader2, AlertCircle, Download, ExternalLink } from 'lucide-react';

interface PdfCanvasViewerProps {
  pdfUrl?: string;
  pdfName?: string;
  pdfText?: string;
  theme?: 'light' | 'dark';
  disableDownload?: boolean;
  filenameBg?: string;
  zoomBg?: string;
  nameContainerBg?: string;
}

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

export default function PdfCanvasViewer({
  pdfUrl,
  pdfName = 'document.pdf',
  pdfText,
  theme = 'dark',
  disableDownload = false,
  filenameBg,
  zoomBg,
  nameContainerBg
}: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.25);
  const [rendering, setRendering] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [simulatedPages, setSimulatedPages] = useState<string[][]>([]);
  const renderTaskRef = useRef<any>(null);

  // Load PDF.js scripts dynamically
  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      setLoading(true);
      setError(null);
      setPdfDoc(null);
      setIsSimulated(false);
      setSimulatedPages([]);
      setIsImage(false);
    }

    const checkIsImage = (url: string): boolean => {
      if (!url) return false;
      const lower = url.toLowerCase();
      return (
        lower.startsWith('data:image/') ||
        lower.endsWith('.png') ||
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.gif') ||
        lower.endsWith('.svg') ||
        lower.endsWith('.webp')
      );
    };

    if (pdfUrl && checkIsImage(pdfUrl)) {
      if (isMounted) {
        setIsImage(true);
        setTotalPages(1);
        setPageNum(1);
        setError(null);
        setLoading(false);
      }
      return;
    } else {
      if (isMounted) {
        setIsImage(false);
      }
    }

    const loadPdfJS = async () => {
      try {
        const windowAny = window as any;
        if (!windowAny.pdfjsLib) {
          // Add main library script
          const script = document.createElement('script');
          script.src = PDFJS_CDN;
          script.async = true;
          document.head.appendChild(script);

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load PDF script.'));
          });
        }

        if (isMounted) {
          const pdfjsLib = windowAny.pdfjsLib;
          if (pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
          }
          await loadPdfDocument();
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Could not initialize document viewer: ' + err.message);
          setLoading(false);
        }
      }
    };

    const loadPdfDocument = async () => {
      if (!pdfUrl) {
        if (isMounted) {
          const textToUse = pdfText || "Secure Study material. Viewing in encrypted canvas stream.";
          const lines = textToUse.split('\n');
          const linesPerPage = 25;
          const pages: string[][] = [];
          for (let i = 0; i < lines.length; i += linesPerPage) {
            pages.push(lines.slice(i, i + linesPerPage));
          }
          
          setIsSimulated(true);
          setSimulatedPages(pages);
          setTotalPages(pages.length || 1);
          setPageNum(1);
          setError(null);
          setLoading(false);
        }
        return;
      }

      try {
        const windowAny = window as any;
        const pdfjsLib = windowAny.pdfjsLib;
        if (!pdfjsLib) {
          throw new Error('PDF library is not loaded yet');
        }

        let loadingTask;
        if (pdfUrl.startsWith('data:') && pdfUrl.includes('base64,')) {
          const base64Part = pdfUrl.substring(pdfUrl.indexOf('base64,') + 7);
          const raw = atob(base64Part);
          const rawLength = raw.length;
          const array = new Uint8Array(new ArrayBuffer(rawLength));
          for (let i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({ data: array });
        } else {
          loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        }

        const doc = await loadingTask.promise;
        if (isMounted) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setPageNum(1);
          setError(null);
          setLoading(false);
        }
      } catch (err: any) {
        console.warn('[PDF.js load notice] Handled document loading condition gracefully:', err?.message || err);
        if (isMounted) {
          const textToUse = pdfText || "Secure Study material. Viewing in encrypted canvas stream.";
          const lines = textToUse.split('\n');
          const linesPerPage = 25;
          const pages: string[][] = [];
          for (let i = 0; i < lines.length; i += linesPerPage) {
            pages.push(lines.slice(i, i + linesPerPage));
          }
          
          setIsSimulated(true);
          setSimulatedPages(pages);
          setTotalPages(pages.length || 1);
          setPageNum(1);
          setError(null);
          setLoading(false);
        }
      }
    };

    loadPdfJS();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfUrl, pdfText]);

  // Render high fidelity canvas page
  useEffect(() => {
    if (!pdfDoc && !isSimulated) return;
    let isCurrent = true;

    const renderPage = async () => {
      if (rendering) {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }
      }
      setRendering(true);

      if (isSimulated) {
        try {
          if (!isCurrent || !canvasRef.current || !containerRef.current) return;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          if (!context) return;

          // Custom simulated paper dimensions (A4 ratio)
          const containerWidth = containerRef.current.clientWidth || 600;
          const pageWidth = Math.min(containerWidth - 32, 800);
          const pageHeight = pageWidth * 1.414; // A4 aspect ratio

          // DPR support
          const dpr = window.devicePixelRatio || 1;
          canvas.width = pageWidth * dpr;
          canvas.height = pageHeight * dpr;
          canvas.style.width = `${pageWidth}px`;
          canvas.style.height = `${pageHeight}px`;

          context.scale(dpr, dpr);

          // Fill background (bright cream/white for worksheet look)
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, pageWidth, pageHeight);

          // Draw simple ruled paper lines if we want a neat notebook look
          context.strokeStyle = 'rgba(0, 100, 255, 0.04)';
          context.lineWidth = 1;
          for (let y = 100; y < pageHeight; y += 28) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(pageWidth, y);
            context.stroke();
          }

          // Draw left pink margin rule
          context.strokeStyle = 'rgba(255, 0, 100, 0.15)';
          context.lineWidth = 1.5;
          context.beginPath();
          context.moveTo(60, 0);
          context.lineTo(60, pageHeight);
          context.stroke();

          // Draw a secure background pattern or watermark
          context.save();
          context.translate(pageWidth / 2, pageHeight / 2);
          context.rotate(-Math.PI / 6);
          context.font = 'bold 24px "Inter", "Helvetica", Arial, sans-serif';
          context.fillStyle = 'rgba(100, 100, 100, 0.05)';
          context.textAlign = 'center';
          context.fillText('SECURE DOCUMENT • DIRECT DOWNLOAD RESTRICTED', 0, -40);
          context.fillText('eShikshaPie INTEGRITY COMPLIANT', 0, 40);
          context.restore();

          // Draw Header
          context.font = 'bold 11px "Inter", "Helvetica", Arial, sans-serif';
          context.fillStyle = '#1e293b'; // slate-800
          context.fillText('eShikshaPie SECURE EDUCATION STREAM', 75, 45);

          context.font = '9px "JetBrains Mono", monospace';
          context.fillStyle = '#64748b'; // slate-500
          context.fillText(`DOCUMENT ID: ${pdfName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`, 75, 60);

          // Draw horizontal break
          context.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(75, 75);
          context.lineTo(pageWidth - 75, 75);
          context.stroke();

          // Draw worksheet text content
          const pageLines = simulatedPages[pageNum - 1] || [];
          context.font = '12px "JetBrains Mono", "Courier New", monospace';
          context.fillStyle = '#0f172a'; // dark slate
          context.textAlign = 'left';

          let startY = 110;
          const lineHeight = 30;

          pageLines.forEach((line) => {
            const maxTextWidth = pageWidth - 140;
            let printedLine = line;
            if (context.measureText(line).width > maxTextWidth) {
              printedLine = line.substring(0, Math.floor(maxTextWidth / 7)) + '...';
            }
            context.fillText(printedLine, 75, startY);
            startY += lineHeight;
          });

          // Draw Footer
          context.strokeStyle = 'rgba(0, 0, 0, 0.06)';
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(75, pageHeight - 75);
          context.lineTo(pageWidth - 75, pageHeight - 75);
          context.stroke();

          context.font = '9px "JetBrains Mono", monospace';
          context.fillStyle = '#94a3b8'; // slate-400
          context.fillText('eShikshaPie SECURE CANVAS READER • STRICT REPRODUCTION FORBIDDEN', 75, pageHeight - 55);
          context.textAlign = 'right';
          context.fillText(`PAGE ${pageNum} OF ${totalPages}`, pageWidth - 75, pageHeight - 55);

          if (isCurrent) {
            setRendering(false);
          }
        } catch (err) {
          console.error('Simulated page render error:', err);
          if (isCurrent) {
            setRendering(false);
          }
        }
        return;
      }

      try {
        const page = await pdfDoc.getPage(pageNum);
        if (!isCurrent || !canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Calculate dynamic scale to fit container width smoothly while respecting zoom settings
        const containerWidth = containerRef.current.clientWidth || 600;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const widthScale = (containerWidth - 32) / unscaledViewport.width;
        
        // Final responsive rendering scale based on container size and user preference
        const targetScale = Math.min(widthScale * scale, 2.5);
        const viewport = page.getViewport({ scale: targetScale });

        // Optimize for Retina / High-DPI screens
        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.scale(dpr, dpr);

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (isCurrent) {
          setRendering(false);
        }
      } catch (err: any) {
        console.error('PDF Page render error:', err);
        if (isCurrent && err.name !== 'RenderingCancelledException') {
          setRendering(false);
        }
      }
    };

    renderPage();

    return () => {
      isCurrent = false;
    };
  }, [pdfDoc, pageNum, scale]);

  // Handle auto-resizing with an event listener
  useEffect(() => {
    const handleResize = () => {
      if (pdfDoc) {
        setScale((prev) => prev); // trigger re-render
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDoc]);

  const handlePrevPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNum < totalPages) {
      setPageNum(pageNum + 1);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(2.5, prev + 0.25));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.75, prev - 0.25));
  };

  const resetZoom = () => {
    setScale(1.25);
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = pdfName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLight = theme === 'light';

  return (
    <div 
      className={`flex flex-col rounded-2xl border overflow-hidden ${
        isLight 
          ? 'bg-slate-50 border-slate-200 text-slate-800 focus:outline-none' 
          : 'bg-[#121216] border-white/10 text-white focus:outline-none'
      }`}
      ref={containerRef}
    >
      {/* Control bar */}
      <div 
        className={`flex flex-wrap items-center justify-between gap-3 p-3 px-4 border-b ${
          isLight 
            ? 'bg-white border-slate-200' 
            : 'bg-[#181822] border-white/5'
        }`}
      >
        <div className={`flex items-center space-x-2 ${nameContainerBg || ''}`}>
          <FileText className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-indigo-400'}`} />
          <span className={`text-[11px] font-mono tracking-wide uppercase truncate max-w-[150px] sm:max-w-[260px] ${filenameBg || ''}`}>
            {pdfName}
          </span>
        </div>

        {/* Page Nav controls */}
        {!loading && !error && totalPages > 0 && (
          <div className="flex items-center space-x-1 bg-black/10 rounded-lg p-1">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={pageNum <= 1}
              className={`p-1 rounded-md transition cursor-pointer disabled:opacity-30 ${
                isLight 
                  ? 'hover:bg-slate-100 text-slate-600' 
                  : 'hover:bg-white/10 text-white'
              }`}
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono select-none px-2 text-center min-w-[70px]">
              {pageNum} / {totalPages}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={pageNum >= totalPages}
              className={`p-1 rounded-md transition cursor-pointer disabled:opacity-30 ${
                isLight 
                  ? 'hover:bg-slate-100 text-slate-600' 
                  : 'hover:bg-white/10 text-white'
              }`}
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Zoom and Aux actions */}
        <div className="flex items-center space-x-2">
          {!loading && !error && (
            <div className={`flex items-center space-x-1 bg-black/10 rounded-lg p-1 ${zoomBg || ''}`}>
              <button
                type="button"
                onClick={zoomOut}
                className={`p-1 rounded-md transition cursor-pointer ${
                  isLight 
                    ? 'hover:bg-slate-100 text-slate-600' 
                    : 'hover:bg-white/10 text-white'
                }`}
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono min-w-[36px] text-center select-none text-slate-400">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                className={`p-1 rounded-md transition cursor-pointer ${
                  isLight 
                    ? 'hover:bg-slate-100 text-slate-600' 
                    : 'hover:bg-white/10 text-white'
                }`}
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className={`p-1 rounded-md transition cursor-pointer ${
                  isLight 
                    ? 'hover:bg-slate-100 text-slate-600' 
                    : 'hover:bg-white/10 text-white'
                }`}
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {pdfUrl && (
            disableDownload ? (
              <div 
                className="p-1 px-1.5 rounded-md text-rose-500 bg-rose-950/35 border border-rose-500/20 opacity-80 cursor-not-allowed flex items-center space-x-1 select-none"
                title="Syllabus Copy Protection: Downloads Disabled"
              >
                <Download className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[9px] font-mono tracking-wider uppercase font-black text-rose-400">LOCKED</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDownload}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isLight 
                    ? 'hover:bg-slate-100 text-slate-600' 
                    : 'hover:bg-white/10 text-white'
                }`}
                title="Download Original PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Canvas Page Body */}
      <div className="flex-1 flex justify-center items-start overflow-x-auto overflow-y-auto p-4 min-h-[450px] max-h-[650px] bg-black/20 select-none relative">
        {loading && (
          <div className="flex flex-col items-center justify-center space-y-2.5 text-center p-6 py-20 z-10 w-full">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-xs font-mono text-slate-400">Loading high-fidelity document stream...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center space-y-3 text-center max-w-md p-6 py-10 z-10 w-full">
            <AlertCircle className="w-10 h-10 text-amber-500" />
            <p className="text-xs font-medium text-slate-300">{error}</p>
            {pdfText && (
              <div 
                className={`w-full text-left p-4 rounded-xl border max-h-[250px] overflow-y-auto font-sans text-xs ${
                  isLight 
                    ? 'bg-white border-slate-200 text-slate-700' 
                    : 'bg-black/40 border-white/5 text-white/80'
                }`}
              >
                <div className="text-[10px] uppercase font-mono text-slate-400 mb-2 border-b pb-1 select-none">
                  Extracted Worksheet Text Fallback:
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed">{pdfText}</pre>
              </div>
            )}
          </div>
        )}

        {!loading && !error && !pdfDoc && !isImage && (
          <div className="text-xs text-slate-400 p-8">No document loaded</div>
        )}

        {/* Direct image rendering for support supplementary files */}
        {!loading && !error && isImage && pdfUrl && (
          <div 
            className="shadow-2xl border border-neutral-800 bg-black/40 p-1.5 my-2 transition-all duration-150 flex items-center justify-center rounded-2xl"
            style={{
              width: `${Math.min(100, Math.max(40, scale * 65))}%`,
              maxWidth: '100%'
            }}
          >
            <img 
              src={pdfUrl} 
              alt={pdfName} 
              className="w-full h-auto object-contain rounded-xl shadow-inner select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Direct canvas rendering targeting standard PDF.js output */}
        {!loading && !error && pdfDoc && (
          <div className="shadow-2xl border border-black/20 bg-white p-1 my-2">
            <canvas ref={canvasRef} className="block cursor-grab active:cursor-grabbing" />
          </div>
        )}
      </div>

      {/* Render-status banner */}
      {rendering && (
        <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded-md z-40 flex items-center space-x-1 shadow-md border border-white/10">
          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
          <span>Refreshing page...</span>
        </div>
      )}
    </div>
  );
}
