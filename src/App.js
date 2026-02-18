
import React, { useState, useMemo, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';

const App = () => {
  // Set default pressure to 50 Pa
  const [inputValue, setInputValue] = useState(50);
  const [unit, setUnit] = useState('Pa'); 
  const [speed, setSpeed] = useState(3);

  const PA_TO_INWC = 1 / 248.84;
  const INWC_TO_PA = 248.84;

  // Convert input value to Pa for calculation logic
  const pressurePa = useMemo(() => {
    return unit === 'Pa' ? inputValue : inputValue * INWC_TO_PA;
  }, [inputValue, unit]);

  useEffect(() => {
    // PWA Manifest and Theme setup for Pixel/Android
    const metaTheme = document.createElement('meta');
    metaTheme.name = "theme-color";
    metaTheme.content = "#1d4ed8";
    document.head.appendChild(metaTheme);

    const metaMobile = document.createElement('meta');
    metaMobile.name = "mobile-web-app-capable";
    metaMobile.content = "yes";
    document.head.appendChild(metaMobile);

    const metaApple = document.createElement('meta');
    metaApple.name = "apple-mobile-web-app-capable";
    metaApple.content = "yes";
    document.head.appendChild(metaApple);

    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0";
    }
    
    document.title = "Gree Flow";
  }, []);

  // Exact data nodes provided by user - NEVER CHANGE THIS CONSTANT
  const speedData = {
    1: [
      { x: 0, y: 1080 }, { x: 25, y: 960 }, { x: 37, y: 900 }, { x: 50, y: 830 }
    ],
    2: [
      { x: 0, y: 1220 }, { x: 25, y: 1120 }, { x: 37, y: 1060 }, { x: 50, y: 990 }, { x: 75, y: 820 }
    ],
    3: [
      { x: 0, y: 1380 }, { x: 25, y: 1250 }, { x: 37, y: 1120 }, { x: 50, y: 1070 }, 
      { x: 75, y: 1020 }, { x: 100, y: 920 }, { x: 125, y: 760 }
    ],
    4: [
      { x: 0, y: 1700 }, { x: 25, y: 1630 }, { x: 37, y: 1580 }, { x: 50, y: 1530 }, 
      { x: 75, y: 1450 }, { x: 100, y: 1400 }, { x: 125, y: 1370 }, { x: 150, y: 1270 }, 
      { x: 175, y: 1150 }, { x: 200, y: 970 }, { x: 225, y: 790 }
    ],
    5: [
      { x: 0, y: 1750 }, { x: 25, y: 1700 }, { x: 37, y: 1650 }, { x: 50, y: 1600 }, 
      { x: 75, y: 1590 }, { x: 100, y: 1500 }, { x: 125, y: 1420 }, { x: 150, y: 1330 }, 
      { x: 175, y: 1200 }, { x: 200, y: 1050 }, { x: 225, y: 950 }, { x: 250, y: 850 }
    ]
  };

  /**
   * Linear Piecewise Interpolation
   */
  const calculateCFM = (p, currentSpeed) => {
    const data = speedData[currentSpeed];
    if (p <= 0) return data[0].y;
    
    for (let i = 0; i < data.length - 1; i++) {
      if (p >= data[i].x && p <= data[i + 1].x) {
        const x0 = data[i].x, y0 = data[i].y;
        const x1 = data[i + 1].x, y1 = data[i + 1].y;
        return Math.round(y0 + (p - x0) * (y1 - y0) / (x1 - x0));
      }
    }

    const lastNode = data[data.length - 1];
    if (p > lastNode.x) return null;

    return null;
  };

  const lineData = useMemo(() => {
    const data = [];
    const maxRatedPa = speedData[speed][speedData[speed].length - 1].x;
    for (let i = 0; i <= maxRatedPa; i += 1) {
      const val = calculateCFM(i, speed);
      if (val !== null) data.push({ x: i, y: val });
    }
    return data;
  }, [speed]);

  const currentCFM = calculateCFM(pressurePa, speed);
  const displayInwc = (pressurePa * PA_TO_INWC).toFixed(3);
  const maxRatedPa = speedData[speed][speedData[speed].length - 1].x;

  const toggleUnit = () => {
    if (unit === 'Pa') {
      setUnit('inwc');
      setInputValue(Number((inputValue * PA_TO_INWC).toFixed(3)));
    } else {
      setUnit('Pa');
      setInputValue(Number((inputValue * INWC_TO_PA).toFixed(0)));
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-900 pb-20 select-none">
      <div className="max-w-6xl mx-auto space-y-4">
        <header className="bg-blue-700 p-6 rounded-2xl shadow-lg text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">Gree Flexx Flow (FXU24HP230V1R32AH)</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-blue-100 uppercase tracking-wider">Speed:</span>
            <div className="bg-blue-800/50 p-1 rounded-xl flex gap-1 border border-blue-400/30">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSpeed(lvl)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${speed === lvl ? 'bg-white text-blue-700 shadow-md' : 'text-blue-100 hover:bg-blue-600/50'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Diagnostics</h2>
              <button onClick={toggleUnit} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md font-bold transition-colors border border-slate-200">
                SWITCH TO {unit === 'Pa' ? 'IN. W.C.' : 'PA'}
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <input 
                  type="number" pattern="\d*" inputMode="decimal"
                  value={inputValue === 0 ? "" : inputValue} 
                  onChange={(e) => setInputValue(Number(e.target.value))}
                  className="w-full p-5 bg-slate-100 border-2 border-transparent focus:border-blue-500 rounded-2xl text-2xl font-mono outline-none"
                  placeholder="0"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  {unit === 'Pa' ? 'Pa' : 'in.w.c.'}
                </span>
              </div>
              <div className="p-6 bg-blue-600 rounded-3xl shadow-xl text-center">
                <div className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Resulting Flow</div>
                <div className="text-5xl font-black text-white">
                  {currentCFM !== null ? currentCFM : "N/R"} 
                  {currentCFM !== null && <span className="text-xl font-medium opacity-80 ml-1">CFM</span>}
                </div>
                {currentCFM === null && <div className="text-[10px] text-blue-100 mt-1 uppercase tracking-tighter">Beyond Rated Static</div>}
              </div>
              <div className="flex justify-between items-center px-2 pt-2 border-t text-xs">
                <span className="text-slate-400 font-medium">Secondary:</span>
                <span className="font-mono font-bold text-slate-600">
                  {unit === 'Pa' ? `${displayInwc} in. w.c.` : `${pressurePa.toFixed(0)} Pa`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-3 overflow-x-auto">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Speed {speed} Manufacturer Table</h2>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-2 border-b font-medium">IN. W.C.</th>
                  <th className="pb-2 border-b font-medium">PA</th>
                  <th className="pb-2 border-b font-medium">TABLE CFM</th>
                  <th className="pb-2 border-b font-medium">MODEL CFM</th>
                  <th className="pb-2 border-b font-medium text-right">ERR %</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {speedData[speed].map((row) => {
                  const predicted = calculateCFM(row.x, speed);
                  const error = Math.abs((predicted - row.y) / row.y * 100).toFixed(1);
                  return (
                    <tr key={row.x} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-2.5 text-slate-400">{(row.x * PA_TO_INWC).toFixed(2)}</td>
                      <td className="py-2.5 text-slate-700 font-bold">{row.x}</td>
                      <td className="py-2.5">{row.y}</td>
                      <td className="py-2.5 text-blue-600 font-bold">{predicted}</td>
                      <td className="py-2.5 text-right text-green-600 font-bold">{error}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Airflow Performance (0 - {maxRatedPa} Pa)</h2>
          <div className="h-[400px] md:h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <ZAxis type="number" range={[100]} />
                <XAxis type="number" dataKey="x" domain={[0, maxRatedPa]} stroke="#64748b" label={{ value: 'Static Pressure (Pa)', position: 'bottom', offset: 15 }} />
                <XAxis xAxisId="inwc" type="number" dataKey="x" domain={[0, maxRatedPa]} orientation="bottom" tickFormatter={(val) => (val * PA_TO_INWC).toFixed(2)} stroke="#94a3b8" axisLine={false} tickLine={false} dy={35} label={{ value: 'Static Pressure (in. w.c.)', position: 'bottom', offset: 50 }} />
                <YAxis type="number" dataKey="y" domain={[0, 1800]} stroke="#64748b" ticks={[0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800]} label={{ value: 'Airflow (CFM)', angle: -90, position: 'insideLeft', offset: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pa = payload[0].payload.x;
                    const cfm = payload.find(p => p.name === "Model")?.value || payload[0].value;
                    return (
                      <div className="bg-slate-800 text-white p-2 rounded-lg text-xs shadow-xl font-mono">
                        <div className="font-bold border-b border-slate-600 mb-1 pb-1">{pa} Pa ({(pa * PA_TO_INWC).toFixed(3)} in.w.c)</div>
                        <div>Flow: {cfm} CFM</div>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend verticalAlign="top" align="right" />
                <Scatter name="Model" data={lineData} fill="#3b82f6" line={{ strokeWidth: 3 }} shape={() => null} />
                <Scatter name="Manufacturer Data" data={speedData[speed]} fill="#ef4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;