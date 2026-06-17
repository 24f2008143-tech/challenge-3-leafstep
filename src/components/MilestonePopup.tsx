import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Trophy, 
  Share2, 
  ChevronLeft, 
  Copy, 
  Check, 
  Award, 
  Download, 
  Image as ImageIcon, 
  ExternalLink,
  Flame,
  Globe2
} from "lucide-react";

interface MilestonePopupProps {
  onClose: () => void;
  points: number;
  milestone: number;
}

const SHARING_TEMPLATES = (milestone: number) => [
  {
    id: "standard",
    label: "🌿 Eco Champion",
    text: `I just unlocked the ${milestone} Leaf Points milestone on Leafstep! Every daily action helps reduce carb emissions. Join the climate journey! 🌿🚀 #Sustainability #Leafstep`,
  },
  {
    id: "numeric",
    label: "🏆 Milestones",
    text: `Milestone Unlocked! Just crossed ${milestone} Leaf Points! Tracking daily energy & resource savings. Every small choice counts! 🌲✨ #EcoFriendly`,
  },
  {
    id: "motivation",
    label: "💪 Team Green",
    text: `From conserving water to active commuting, I've earned ${milestone} LP on Leafstep list! Turning daily decisions into green habits. 🌍💚`,
  },
];

// Helper to resolve milestone tier names & icons
const getMilestoneEmoji = (pts: number) => {
  if (pts <= 200) return "🌱";
  if (pts <= 500) return "🌳";
  if (pts <= 1000) return "🎋";
  if (pts <= 2000) return "🛡️";
  if (pts <= 4000) return "🌲";
  if (pts <= 7500) return "🌍";
  return "👑";
};

const getMilestoneLabel = (pts: number) => {
  if (pts <= 200) return "Eco Apprentice";
  if (pts <= 500) return "Sapling Steward";
  if (pts <= 1000) return "Bamboo Walker";
  if (pts <= 2000) return "Grove Guardian";
  if (pts <= 4000) return "Forest Keeper";
  if (pts <= 7500) return "Earth Steward";
  return "Carbon Champion";
};

const getMilestoneImageLink = (pts: number) => {
  if (pts <= 200) return "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80"; // Bright green sprout leaf
  if (pts <= 500) return "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&auto=format&fit=crop&q=80"; // Sunset sapling
  if (pts <= 1000) return "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80"; // Lush recycling sprout
  if (pts <= 2000) return "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80"; // Tall misty trees
  if (pts <= 4000) return "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&auto=format&fit=crop&q=80"; // Sunlit forest
  if (pts <= 7500) return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80"; // Deep space green blue earth
  return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80"; // Majestic clean green mountain range
};

export default function MilestonePopup({ onClose, points, milestone }: MilestonePopupProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [previewTab, setPreviewTab] = useState<"social" | "canvas">("social");
  const templates = SHARING_TEMPLATES(milestone);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [customText, setCustomText] = useState(templates[0].text);
  
  // Custom states for clipping/sharing feedback
  const [isTextCopied, setIsTextCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [copyImageSuccess, setCopyImageSuccess] = useState<boolean | null>(null);
  
  const [cardImageUrl, setCardImageUrl] = useState<string>("");

  // Clear or enable the auto-close timer based on whether the user is customizing
  useEffect(() => {
    if (isSharing) return; 
    const timer = setTimeout(onClose, 8000); // 8 seconds celebrate on mount
    return () => clearTimeout(timer);
  }, [onClose, isSharing]);

  // Redraw canvas card representation whenever milestone or customText changes
  useEffect(() => {
    if (!isSharing) return;

    const canvas = document.createElement("canvas");
    const width = 800;
    const height = 450;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw solid elegant dark background
    const gradient = ctx.createRadialGradient(width * 0.1, height * 0.9, 50, width * 0.4, height * 0.7, 520);
    gradient.addColorStop(0, "#0D1B2A"); // Deep Slate Dark Blue
    gradient.addColorStop(0.6, "#08101E"); // Charcoal Night
    gradient.addColorStop(1, "#030712"); // Pitch Black Core
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw visual grid with low opacity
    ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw glowing neon light rings in background
    ctx.fillStyle = "rgba(200, 245, 0, 0.04)";
    ctx.shadowColor = "#C8F500";
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(80, 80, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0, 229, 255, 0.05)";
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 50;
    ctx.beginPath();
    ctx.arc(width - 150, height - 100, 120, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow state
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    // Double frame border
    ctx.strokeStyle = "rgba(200, 245, 0, 0.3)"; // Neon outer golden lime
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.strokeStyle = "rgba(0, 229, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, width - 56, height - 56);

    // Modern tracking label top left
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "bold 11px sans-serif";
    ctx.letterSpacing = "5px";
    ctx.fillText("L E A F S T E P  C L I M A T E  A C T I O N  N E T W O R K", 50, 60);

    // Title left column
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "italic italic 900 44px sans-serif";
    ctx.fillText("MILESTONE UNLOCKED", 50, 115);

    // Points display left
    ctx.fillStyle = "#C8F500";
    ctx.font = "extrabold 32px monospace";
    ctx.fillText(`${milestone} LP VERIFIED`, 50, 165);

    // Divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 200);
    ctx.lineTo(width - 320, 200);
    ctx.stroke();

    // Text box glass overlay
    ctx.fillStyle = "rgba(17, 24, 39, 0.6)";
    ctx.beginPath();
    const rx = 50;
    const ry = 220;
    const rw = width - 370;
    const rh = 120;
    const rrad = 12;
    if (ctx.roundRect) {
      ctx.roundRect(rx, ry, rw, rh, rrad);
    } else {
      ctx.rect(rx, ry, rw, rh);
    }
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.stroke();

    // Multi-line wrap customized text inside the glass overlay
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 15px sans-serif";
    const maxTextWidth = rw - 40;
    const lineHeight = 24;
    let textY = ry + 28;

    const words = customText.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxTextWidth && n > 0) {
        ctx.fillText(line, rx + 20, textY);
        line = words[n] + " ";
        textY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, rx + 20, textY);

    // Draw badge area right
    const badgeX = width - 180;
    const badgeY = height / 2 + 10;

    // Glowing circle perimeter for badge
    ctx.shadowColor = "#C8F500";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "#C8F500";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 82, 0, Math.PI * 2);
    ctx.stroke();

    // inner container solid
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 78, 0, Math.PI * 2);
    ctx.fill();

    // Ring visual overlay
    ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 70, 0, Math.PI * 2);
    ctx.stroke();

    // Render Milestone Emoji
    ctx.font = "74px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(getMilestoneEmoji(milestone), badgeX, badgeY - 5);

    // Label under energy emoji inside ring
    ctx.fillStyle = "#00e5ff";
    ctx.font = "bold 10px monospace";
    ctx.letterSpacing = "2px";
    ctx.fillText(getMilestoneLabel(milestone).toUpperCase(), badgeX, badgeY + 48);

    // Footer brand text
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(16, 185, 129, 0.65)";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("🌿 Join the green future: leafstep.app", 50, height - 54);

    try {
      const dataUrl = canvas.toDataURL("image/png");
      setCardImageUrl(dataUrl);
    } catch (err) {
      console.error("Canvas toDataURL failed:", err);
    }
  }, [milestone, customText, isSharing]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const selected = templates.find((t) => t.id === templateId);
    if (selected) {
      setCustomText(selected.text);
    }
    setIsTextCopied(false);
  };

  const handleCopyText = async () => {
    try {
      const imgUrl = getMilestoneImageLink(milestone);
      const summary = `${customText}\n\n🏆 Achievement Level: ${getMilestoneLabel(milestone)}\n🌿 Verified Milestone Image: ${imgUrl}\n🌍 Join me in saving carbon: https://leafstep.app`;
      await navigator.clipboard.writeText(summary);
      setIsTextCopied(true);
      setTimeout(() => setIsTextCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      // Mock shareable achievement URL
      const shareLink = `https://leafstep.app/share/achievement/${milestone}`;
      await navigator.clipboard.writeText(shareLink);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleCopyImageToClipboard = async () => {
    if (!cardImageUrl) return;
    try {
      const response = await fetch(cardImageUrl);
      const blob = await response.blob();
      
      if (typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            ["image/png"]: blob
          })
        ]);
        setCopyImageSuccess(true);
        setTimeout(() => setCopyImageSuccess(null), 2500);
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (err) {
      console.warn("Direct clipboard image write failed:", err);
      setCopyImageSuccess(false);
      setTimeout(() => setCopyImageSuccess(null), 3000);
    }
  };

  const handleDownload = () => {
    if (!cardImageUrl) return;
    const link = document.createElement("a");
    link.href = cardImageUrl;
    link.download = `leaf_strophy_${milestone}lp.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
      >
        <motion.div
          className="rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-white/10 flex flex-col relative overflow-hidden"
          style={{
            background: "radial-gradient(circle at 50% 50%, #132237 0%, #0B1220 100%)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 30px rgba(0,0,0,0.5)"
          }}
          initial={{ y: 30, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 30, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Neon accents in dialog frame */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C8F500] to-transparent opacity-80" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00e5ff]/30 to-transparent opacity-50" />

          <AnimatePresence mode="wait">
            {!isSharing ? (
              <motion.div
                key="congrats-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-center py-4"
              >
                {/* Glowing Trophy Rings */}
                <div className="w-24 h-24 bg-[#1f2937] rounded-full flex items-center justify-center mx-auto mb-6 relative border-2 border-[#C8F500]/50 shadow-[0_0_24px_rgba(200,245,0,0.25)]">
                  <Trophy className="w-12 h-12 text-[#C8F500]" />
                  <span className="text-4xl absolute -top-1 -right-1 drop-shadow-md">{getMilestoneEmoji(milestone)}</span>
                  <Sparkles className="w-6 h-6 absolute animate-pulse text-[#00e5ff] mt-12 ml-12" />
                </div>

                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-[#111827] bg-[#C8F500] px-3 py-1 rounded-full mb-3 tracking-wider shadow-md">
                  Achievement Decoded
                </div>

                <h2 
                  className="text-3xl font-black text-white italic uppercase tracking-tight mb-2"
                  style={{ textShadow: "0 0 15px rgba(255,255,255,0.15)" }}
                >
                  {milestone} LP Reached!
                </h2>
                
                <p className="text-sm text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
                  Outstanding work! You've crossed the <strong className="text-[#C8F500]">"{getMilestoneLabel(milestone)}"</strong> milestone checkpoint on Leafstep. Every climate decision is compounding into direct atmospheric recovery.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={onClose}
                    className="w-full bg-[#C8F500] hover:bg-[#b8e600] text-[#111827] font-black py-4 px-6 rounded-2xl active:translate-y-[1px] transition duration-200 flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest shadow-[0_4px_12px_rgba(200,245,0,0.25)]"
                    style={{ borderBottom: "4px solid #8FA200" }}
                  >
                    Magnificent!
                  </button>
                  
                  <button
                    onClick={() => setIsSharing(true)}
                    className="w-full bg-slate-800/80 hover:bg-slate-700/80 hover:text-white text-slate-200 font-extrabold py-3.5 px-6 rounded-2xl transition duration-200 border border-slate-700/60 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                  >
                    <Share2 className="w-4 h-4 text-[#00e5ff] animate-pulse" />
                    Share Active Achievement
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="share-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 text-left font-sans"
              >
                {/* Customizer Navigation Header */}
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <button
                    onClick={() => {
                      setIsSharing(false);
                      setIsTextCopied(false);
                      setIsLinkCopied(false);
                    }}
                    className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-white uppercase italic tracking-wide">Share Achievement</h3>
                    <p className="text-[10px] text-slate-400 truncate">Generate image preview & export verified trophy card</p>
                  </div>
                </div>

                {/* PREMIUM GENERATED CARD CANVAS PREVIEW & SOCIAL CARD */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label id="preview-mode-label" className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Globe2 className="w-3.5 h-3.5 text-[#00e5ff]" />
                      Preview Mode
                    </label>
                    <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        id="btn-preview-tab-social"
                        onClick={() => setPreviewTab("social")}
                        className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-md transition-all duration-150 ${
                          previewTab === "social"
                            ? "bg-[#C8F500] text-slate-950 font-black"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Social Post
                      </button>
                      <button
                        id="btn-preview-tab-canvas"
                        onClick={() => setPreviewTab("canvas")}
                        className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-md transition-all duration-150 ${
                          previewTab === "canvas"
                            ? "bg-[#C8F500] text-slate-950 font-black"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        HD Graphic
                      </button>
                    </div>
                  </div>

                  {previewTab === "social" ? (
                    <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950 font-sans shadow-lg space-y-3">
                      {/* Simulated User Profile */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-black text-xs text-[#C8F500]">
                          U
                        </div>
                        <div className="leading-tight flex-1">
                          <div className="font-bold text-xs text-white flex items-center gap-1">
                            <span>You</span>
                            <span className="w-3.5 h-3.5 bg-sky-500 rounded-full flex items-center justify-center text-[8px] font-black text-white" title="Verified Champion">✓</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">@climate_champion • Just now</div>
                        </div>
                        <div className="flex bg-slate-900 border border-slate-800 rounded-full py-0.5 px-2 text-[9px] font-mono text-[#C8F500] items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          LIVE PREVIEW
                        </div>
                      </div>

                      {/* Customized shared message text */}
                      <p className="text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                        {customText}
                      </p>

                      {/* SOCIAL RICH ACCREDITED GRAPHIC CARD DESIGN */}
                      <div className="rounded-xl border border-slate-800/85 overflow-hidden bg-slate-400/5 shadow-md group hover:border-[#00e5ff]/30 transition-all duration-300">
                        {/* Beautiful Visual Cover */}
                        <div className="aspect-[1.91/1] w-full relative overflow-hidden bg-slate-950 flex items-center justify-center">
                          <img
                            src={getMilestoneImageLink(milestone)}
                            alt="Leafstep Cloud Achievement Card Thumbnail"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                          
                          {/* Inner Floated Ribbon Badge */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white">
                            <span className="text-sm">{getMilestoneEmoji(milestone)}</span>
                            <span className="font-bold tracking-tight text-[#C8F500] pr-0.5">Rank: {getMilestoneLabel(milestone)}</span>
                          </div>

                          <div className="absolute top-3 right-3 bg-[#C8F500] text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md">
                            Verified Impact
                          </div>
                        </div>

                        {/* Rich Details Area */}
                        <div className="p-3 border-t border-slate-850/45">
                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
                            LEAFSTEP.APP
                          </div>
                          <div className="font-bold text-xs text-white tracking-tight leading-snug mb-1">
                            🌿 Verified Climate Milestone: Just crossed {milestone} Leaf Points!
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                            I am building modern carbon-saving habits with Leafstep. See my live verified tree logs and unlocked achievements.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border border-slate-700/60 rounded-2xl overflow-hidden aspect-[16/9] shadow-inner bg-slate-950 flex items-center justify-center">
                      {cardImageUrl ? (
                        <motion.img 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          src={cardImageUrl} 
                          alt="Leafstep Trophy Card"
                          className="w-full h-full object-contain select-none"
                        />
                      ) : (
                        <span className="text-xs text-slate-500 font-mono flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          Generating Canvas PNG...
                        </span>
                      )}

                      {/* Quick Watermark Sparkle */}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black text-[#C8F500] px-2 py-0.5 rounded-full select-none">
                        16:9 HD GRAPHIC
                      </div>
                    </div>
                  )}
                </div>

                {/* CLIPBOARD & EXPORT BUTTONS ROW */}
                <div id="sharing-action-buttons" className="grid grid-cols-3 gap-2">
                  {/* Download Card */}
                  <button
                    id="btn-download-trophy"
                    onClick={handleDownload}
                    className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-200 border border-slate-700 rounded-xl font-bold text-[10px] uppercase flex flex-col items-center justify-center gap-1 transition-all duration-200 shadow-md active:translate-y-[1px]"
                    title="Download HD PNG Trophy File"
                  >
                    <Download className="w-4 h-4 text-[#C8F500]" />
                    <span>Download PNG</span>
                  </button>

                  {/* Copy Image blob to clipboard */}
                  <button
                    id="btn-copy-image-clipboard"
                    onClick={handleCopyImageToClipboard}
                    className={`py-2.5 px-2 text-slate-200 border rounded-xl font-bold text-[10px] uppercase flex flex-col items-center justify-center gap-1 transition-all duration-200 shadow-md active:translate-y-[1px] ${
                      copyImageSuccess === true
                        ? "bg-slate-950 border-emerald-500/50 text-[#00e5ff]"
                        : copyImageSuccess === false
                        ? "bg-amber-950/20 border-amber-600/50 text-amber-300"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700"
                    }`}
                    title="Copy PNG directly to clipboard"
                  >
                    {copyImageSuccess === true ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 text-[#00e5ff]" />
                        <span>Copy Card</span>
                      </>
                    )}
                  </button>

                  {/* Copy link */}
                  <button
                    id="btn-copy-simulated-link"
                    onClick={handleCopyLink}
                    className={`py-2.5 px-2 text-slate-200 border rounded-xl font-bold text-[10px] uppercase flex flex-col items-center justify-center gap-1 transition-all duration-200 shadow-md active:translate-y-[1px] ${
                      isLinkCopied
                        ? "bg-slate-950 border-[#00e5ff]/55"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700"
                    }`}
                    title="Get a simulated share link"
                  >
                    {isLinkCopied ? (
                      <>
                        <Check className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 text-[#C8F500]" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Show Copy Image Fallback advice if copying fails */}
                {copyImageSuccess === false && (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[9px] rounded-lg p-2 leading-relaxed">
                    Clipboard image block detected! No worries—use the <strong>"Download PNG"</strong> button to save the card directly to your folder, or copy the Share Text below.
                  </div>
                )}

                {/* PRESET TEMPLATE ROW */}
                <div id="caption-templates-section">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Preset Caption Templates
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {templates.map((t) => (
                      <button
                        id={`btn-template-preset-${t.id}`}
                        key={t.id}
                        onClick={() => handleTemplateChange(t.id)}
                        className={`py-2.5 px-2 text-[10px] font-semibold rounded-xl border text-center truncate transition-all duration-200 ${
                          selectedTemplate === t.id
                            ? "border-[#C8F500] bg-[#C8F500]/10 text-[#C8F500] font-black"
                            : "border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CUSTOM STORY EDITOR */}
                <div id="custom-story-editor">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Edit Share Text
                    </label>
                    <span className="text-[9.5px] font-mono text-slate-500 font-semibold">
                      {customText.length}/240 chars
                    </span>
                  </div>
                  <textarea
                    id="textarea-caption-editor"
                    value={customText}
                    onChange={(e) => {
                      setCustomText(e.target.value.substring(0, 240));
                      setIsTextCopied(false);
                    }}
                    rows={2.5}
                    className="w-full rounded-2xl border border-slate-700/60 p-3 text-xs bg-slate-950 focus:border-[#C8F500] text-slate-200 leading-relaxed outline-none resize-none font-medium text-[11.5px]"
                    placeholder="Write your custom achievements story..."
                  />
                </div>

                {/* COPY STORY CAPTION SUBMISSION */}
                <div id="sharing-navigation-footer" className="flex gap-2 pb-1">
                  <button
                    id="btn-share-back"
                    onClick={() => {
                      setIsSharing(false);
                      setIsTextCopied(false);
                      setIsLinkCopied(false);
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 py-3.5 px-4 rounded-xl font-bold text-xs uppercase border border-slate-700"
                  >
                    Back
                  </button>
                  
                  <button
                    id="btn-copy-share-text"
                    onClick={handleCopyText}
                    className={`flex-[2] py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-250 select-none ${
                      isTextCopied 
                        ? "bg-slate-950 text-[#C8F500] border-2 border-[#C8F500] shadow-[0_0_15px_rgba(200,245,0,0.2)]"
                        : "bg-[#00e5ff] hover:bg-cyan-400 text-slate-950 shadow-md font-bold"
                    }`}
                  >
                    {isTextCopied ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        Text Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Share Text
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
