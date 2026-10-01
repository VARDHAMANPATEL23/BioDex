"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Camera,
	Upload,
	Link as LinkIcon,
	Dna,
	History,
	Shield,
	Activity,
	Layers,
	Sparkles,
	LogOut,
	Compass,
	Utensils,
	Globe,
	Binary,
	Radio,
	RefreshCw,
	Sliders,
	CheckCircle2,
	Scan,
	Maximize2,
	Share2,
	Smartphone,
	Eye,
} from "lucide-react";
import DNAHelix3D from "@/components/DNAHelix3D";
import ParticlesBackground from "@/components/react-bits/ParticlesBackground";
import DecryptedText from "@/components/react-bits/DecryptedText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	detectSpeciesTheme,
	THEME_REGISTRY,
	SpeciesTheme,
} from "@/lib/themeDetector";
import {
	predictFromUpload,
	predictFromURL,
	saveToHistory,
	getHistory,
	loginUser,
	registerUser,
} from "@/services/api";

export default function BioDexApp() {
	const [activeTab, setActiveTab] = useState<"scan" | "history" | "auth">(
		"scan",
	);
	const [loading, setLoading] = useState(false);
	const [urlInput, setUrlInput] = useState("");
	const [prediction, setPrediction] = useState<any>(null);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [historyList, setHistoryList] = useState<any[]>([]);
	const [userEmail, setUserEmail] = useState<string | null>(null);
	const [showThemeModal, setShowThemeModal] = useState(false);

	// Direct camera capture ref for mobile
	const cameraInputRef = useRef<HTMLInputElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Manual theme override if user wants to preview themes
	const [manualTheme, setManualTheme] = useState<SpeciesTheme | null>(null);

	// Auth form
	const [authEmail, setAuthEmail] = useState("");
	const [authPass, setAuthPass] = useState("");
	const [isRegisterMode, setIsRegisterMode] = useState(false);
	const [authMsg, setAuthMsg] = useState("");

	useEffect(() => {
		const savedToken = localStorage.getItem("user_token");
		const savedEmail = localStorage.getItem("user_email");
		if (savedToken && savedEmail) {
			setUserEmail(savedEmail);
		}
	}, []);

	const detectedThemeMeta = detectSpeciesTheme(prediction);
	const activeThemeMeta = manualTheme
		? THEME_REGISTRY[manualTheme]
		: detectedThemeMeta;

	const handleAuthSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAuthMsg("");
		try {
			const res = isRegisterMode
				? await registerUser(authEmail, authPass)
				: await loginUser(authEmail, authPass);

			if (res.token) {
				localStorage.setItem("user_token", res.token);
				localStorage.setItem("user_email", authEmail);
				setUserEmail(authEmail);
				setActiveTab("scan");
			}
		} catch (err: any) {
			setAuthMsg(err.response?.data?.detail || err.message || "Authentication Failed. Ensure Backend and Database are Online.");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("user_token");
		localStorage.removeItem("user_email");
		setUserEmail(null);
	};

	const processFile = async (file: File) => {
		const objectUrl = URL.createObjectURL(file);
		setPreviewImage(objectUrl);
		setLoading(true);
		setManualTheme(null);

		try {
			const res = await predictFromUpload(file);
			if (res.status === "success") {
				const pred = res.prediction;
				pred.image_url = objectUrl;
				setPrediction(pred);
				saveToHistory(pred, objectUrl).catch(() => {});
			} else {
				alert(res.message || "Failed to analyze specimen.");
			}
		} catch (err: any) {
			console.error(err);
			alert(
				err.response?.data?.detail || "Error connecting to AI Backend.",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) await processFile(file);
	};

	const handleUrlSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!urlInput.trim()) return;

		setPreviewImage(urlInput.trim());
		setLoading(true);
		setManualTheme(null);

		try {
			const res = await predictFromURL(urlInput.trim());
			if (res.status === "success") {
				const pred = res.prediction;
				if (!pred.image_url) pred.image_url = urlInput.trim();
				setPrediction(pred);
				saveToHistory(pred, urlInput.trim()).catch(() => {});
			} else {
				alert(res.message || "Failed to analyze URL.");
			}
		} catch (err: any) {
			console.error(err);
			alert(
				err.response?.data?.detail || "Error fetching image from URL.",
			);
		} finally {
			setLoading(false);
		}
	};

	const loadHistory = async () => {
		try {
			const res = await getHistory();
			if (res?.data) {
				setHistoryList(res.data);
			}
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		if (activeTab === "history") {
			loadHistory();
		}
	}, [activeTab]);

	return (
		<div
			data-theme={activeThemeMeta.theme}
			className="flex flex-col lg:flex-row min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-700 relative  select-none"
		>
			{/* Dynamic React Bits Interconnected Particles */}
			<ParticlesBackground
				color={activeThemeMeta.primaryColor}
				count={40}
			/>

			{/* DESKTOP SIDEBAR NAVIGATION (Hidden on mobile) */}
			<aside className="hidden lg:flex w-72 bg-[#101014]/40 backdrop-blur-2xl border-r border-white/[0.08] flex-col justify-between shrink-0 backdrop-blur-xl z-20 sticky top-0 h-screen">
				<div className="overflow-y-auto">
					{/* Logo & System Brand */}
					<div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
						<div className="flex items-center gap-3">
							<motion.div
								whileHover={{ rotate: 180 }}
								transition={{ duration: 0.6 }}
								className="w-10 h-10 rounded-xl bg-[var(--theme-primary-dim)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)] shadow-[0_0_15px_var(--theme-primary-glow)] transition-all duration-500"
							>
								<Dna size={22} />
							</motion.div>
							<div>
								<div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
									<span>BioDex</span>
								</div>
								<div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
									Spectral Species Engine
								</div>
							</div>
						</div>
					</div>

					{/* Current Dynamic State Indicator */}
					<div className="p-4 mx-3 my-3 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col gap-1.5 font-mono text-[11px]">
						<div className="flex items-center justify-between">
							<span className="text-zinc-500 uppercase tracking-wider text-[9px]">
								Active Matrix
							</span>
							<span className="flex items-center gap-1.5 text-[var(--theme-primary)] font-bold text-[10px]">
								<Radio size={10} className="animate-pulse" />
								{activeThemeMeta.code}
							</span>
						</div>
						<div className="text-zinc-300 font-semibold truncate text-[11px]">
							{activeThemeMeta.title}
						</div>
						<div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1">
							<div
								className="h-full bg-[var(--theme-primary)] transition-all duration-700"
								style={{ width: "100%" }}
							/>
						</div>
					</div>

					{/* Navigation Links */}
					<nav className="p-3 space-y-1">
						<div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-zinc-500 font-bold font-mono">
							Operational Modes
						</div>
						<button
							onClick={() => setActiveTab("scan")}
							className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
								activeTab === "scan"
									? "bg-[var(--theme-primary-dim)] text-[var(--theme-primary)] border border-[var(--theme-border)] shadow-[0_0_12px_var(--theme-primary-glow)]"
									: "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
							}`}
						>
							<Camera size={16} />
							Optical Sensor Analyzer
						</button>

						<button
							onClick={() => setActiveTab("history")}
							className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
								activeTab === "history"
									? "bg-[var(--theme-primary-dim)] text-[var(--theme-primary)] border border-[var(--theme-border)] shadow-[0_0_12px_var(--theme-primary-glow)]"
									: "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
							}`}
						>
							<History size={16} />
							Specimen Registry Logs
						</button>

						<div className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-widest text-zinc-500 font-bold font-mono">
							Telemetry & Session
						</div>
						<button
							onClick={() => setActiveTab("auth")}
							className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
								activeTab === "auth"
									? "bg-[var(--theme-primary-dim)] text-[var(--theme-primary)] border border-[var(--theme-border)] shadow-[0_0_12px_var(--theme-primary-glow)]"
									: "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
							}`}
						>
							<Shield size={16} />
							{userEmail
								? "Authorized Identity"
								: "Cloud Authentication"}
						</button>
					</nav>

					{/* Theme Palette Tester */}
					<div className="px-4 py-3 mx-3 mt-2 rounded-xl bg-zinc-950/60 border border-white/[0.04]">
						<div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono mb-2 flex items-center gap-1.5">
							<Sliders size={11} />
							<span>Theme Override</span>
						</div>
						<div className="grid grid-cols-4 gap-1.5">
							{(
								Object.keys(THEME_REGISTRY) as SpeciesTheme[]
							).map((thmKey) => (
								<button
									key={thmKey}
									onClick={() => setManualTheme(thmKey)}
									className={`text-[9px] font-mono py-1 rounded border transition-all ${
										activeThemeMeta.theme === thmKey
											? "border-[var(--theme-primary)] text-white font-bold bg-white/5"
											: "border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/20"
									}`}
									title={THEME_REGISTRY[thmKey].title}
								>
									{thmKey.slice(0, 4).toUpperCase()}
								</button>
							))}
						</div>
						{manualTheme && (
							<button
								onClick={() => setManualTheme(null)}
								className="text-[10px] text-zinc-400 hover:text-[var(--theme-primary)] mt-2 font-mono flex items-center gap-1"
							>
								<RefreshCw size={10} /> Auto-Detect Mode
							</button>
						)}
					</div>
				</div>

				{/* User Footer */}
				<div className="p-4 border-t border-white/[0.08] bg-black/20">
					{userEmail ? (
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5 overflow-hidden">
								<div className="w-8 h-8 rounded-lg bg-[var(--theme-primary-dim)] text-[var(--theme-primary)] border border-[var(--theme-border)] flex items-center justify-center font-mono font-bold text-xs shrink-0">
									{userEmail[0].toUpperCase()}
								</div>
								<div className="truncate">
									<div className="text-xs font-semibold text-zinc-200 truncate">
										{userEmail}
									</div>
									<div className="text-[10px] text-zinc-500 font-mono">
										Atlas Session Online
									</div>
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleLogout}
								className="text-zinc-400 hover:text-rose-400"
								title="Logout"
							>
								<LogOut size={16} />
							</Button>
						</div>
					) : (
						<div className="flex items-center justify-between text-xs text-zinc-400">
							<span className="font-mono text-[11px]">
								Laboratory Standby
							</span>
							<button
								onClick={() => setActiveTab("auth")}
								className="text-[var(--theme-primary)] hover:underline font-semibold font-mono text-xs"
							>
								Sign In
							</button>
						</div>
					)}
				</div>
			</aside>

			{/* MOBILE STICKY TOP BAR */}
			<header className="lg:hidden sticky top-0 z-30 h-14 border-b border-white/[0.08] bg-[#0c0c10]/40 backdrop-blur-2xl px-4 flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					<div className="w-7 h-7 rounded-lg bg-[var(--theme-primary-dim)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)]">
						<Dna size={16} />
					</div>
					<span className="text-sm font-bold text-white tracking-tight">
						BioDex
					</span>
					<Badge
						variant="scientific"
						className="text-[9px] py-0 px-1.5"
					>
						{activeThemeMeta.code}
					</Badge>
				</div>

				<div className="flex items-center gap-2">
					{/* Quick theme trigger button */}
					<button
						onClick={() => setShowThemeModal(!showThemeModal)}
						className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
						title="Theme Override"
					>
						<Sliders size={14} />
					</button>
					<div
						className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_var(--theme-primary)]"
						style={{
							backgroundColor: activeThemeMeta.primaryColor,
						}}
					/>
				</div>
			</header>

			{/* MOBILE THEME MODAL DRAWER */}
			{showThemeModal && (
				<div className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-end p-4">
					<motion.div
						initial={{ y: 100, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 100, opacity: 0 }}
						className="w-full bg-[#121216]/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl"
					>
						<div className="flex items-center justify-between">
							<span className="text-xs font-mono font-bold uppercase text-zinc-300">
								Species Matrix Palette
							</span>
							<button
								onClick={() => setShowThemeModal(false)}
								className="text-xs text-zinc-500 hover:text-white"
							>
								Close
							</button>
						</div>
						<div className="grid grid-cols-3 gap-2">
							{(
								Object.keys(THEME_REGISTRY) as SpeciesTheme[]
							).map((thmKey) => (
								<button
									key={thmKey}
									onClick={() => {
										setManualTheme(thmKey);
										setShowThemeModal(false);
									}}
									className={`text-xs font-mono py-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
										activeThemeMeta.theme === thmKey
											? "border-[var(--theme-primary)] text-white font-bold bg-white/5"
											: "border-white/5 text-zinc-400"
									}`}
								>
									<div
										className="w-3 h-3 rounded-full"
										style={{
											backgroundColor:
												THEME_REGISTRY[thmKey]
													.primaryColor,
										}}
									/>
									<span>{thmKey.toUpperCase()}</span>
								</button>
							))}
						</div>
						{manualTheme && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setManualTheme(null);
									setShowThemeModal(false);
								}}
								className="w-full text-xs font-mono"
							>
								Reset to Auto Detection
							</Button>
						)}
					</motion.div>
				</div>
			)}

			{/* MAIN SCIENTIFIC WORKSPACE */}
			<main className="flex-1 flex flex-col min-w-0 z-10 pb-20 lg:pb-0">
				{/* Desktop Top Header Bar */}
				<header className="hidden lg:flex h-16 border-b border-white/[0.08] bg-[#0c0c10]/40 backdrop-blur-2xl px-6 items-center justify-between">
					<div className="flex items-center gap-3">
						<motion.span
							animate={{ scale: [1, 1.2, 1] }}
							transition={{ repeat: Infinity, duration: 2.5 }}
							className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_var(--theme-primary)]"
							style={{
								backgroundColor: activeThemeMeta.primaryColor,
							}}
						/>
						<h1 className="text-sm font-semibold tracking-wide text-zinc-200">
							Biological Intelligence Pipeline · Neural
							Classification & Genomic Synthesis
						</h1>
					</div>
					<div className="flex items-center gap-3 text-xs">
						<Badge variant="scientific">
							<Activity
								size={12}
								className="mr-1 text-[var(--theme-primary)]"
							/>
							PaliGemma-3B Active
						</Badge>
						
					</div>
				</header>

				{/* Content Viewport */}
				<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
					<AnimatePresence mode="wait">
						{/* TAB: OPTICAL CLASSIFIER */}
						{activeTab === "scan" && (
							<motion.div
								key="tab-scan"
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -12 }}
								transition={{ duration: 0.3 }}
								className="space-y-5 sm:space-y-6 max-w-7xl mx-auto"
							>
								{/* SENSOR INGESTION HERO */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 bg-[#121216]/40 backdrop-blur-2xl border border-[var(--theme-border)] rounded-3xl p-5 sm:p-6 lg:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-500">
									{/* File Dropzone & Mobile Camera Launcher */}
									<div className="flex flex-col gap-3">
										<label className="border-2 border-dashed border-[var(--theme-border)] hover:border-[var(--theme-primary)] bg-[var(--theme-primary-dim)] rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group min-h-[180px] sm:min-h-[220px]">
											<motion.div
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.95 }}
												className="w-12 h-12 sm:w-14 sm:h-14 rounded-3xl bg-black/40 border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)] shadow-[0_0_20px_var(--theme-primary-glow)] transition-all"
											>
												<Upload size={22} />
											</motion.div>
											<div className="text-center">
												<span className="text-sm font-bold text-zinc-100 block">
													Ingest Biological Specimen
												</span>
												<span className="text-xs text-zinc-400 mt-1 block">
													Upload image file from
													device storage
												</span>
											</div>
											<input
												ref={fileInputRef}
												type="file"
												accept="image/*"
												onChange={handleFileUpload}
												className="hidden"
											/>
										</label>

										{/* Mobile-Friendly Direct Camera Trigger */}
										<div className="flex items-center gap-2">
											<Button
												type="button"
												variant="secondary"
												onClick={() =>
													cameraInputRef.current?.click()
												}
												className="flex-1 font-mono text-xs gap-2 py-2"
											>
												<Camera
													size={14}
													className="text-[var(--theme-primary)]"
												/>
												<span>Take Photo (Camera)</span>
											</Button>
											<input
												ref={cameraInputRef}
												type="file"
												accept="image/*"
												capture="environment"
												onChange={handleFileUpload}
												className="hidden"
											/>
										</div>
									</div>

									{/* Remote URL Ingest */}
									<div className="flex flex-col justify-between space-y-4">
										<div>
											<h2 className="text-sm font-bold text-zinc-100 mb-1 flex items-center gap-2">
												<LinkIcon
													size={16}
													className="text-[var(--theme-primary)]"
												/>
												<span>
													Remote Specimen Stream
												</span>
											</h2>
											<p className="text-xs text-zinc-400 mb-3">
												Input direct URI from scientific
												databases (iNaturalist,
												Wikimedia, GBIF)
											</p>
											<form
												onSubmit={handleUrlSubmit}
												className="flex gap-2"
											>
												<input
													type="url"
													placeholder="https://.../specimen.jpg"
													value={urlInput}
													onChange={(e) =>
														setUrlInput(
															e.target.value,
														)
													}
													className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--theme-primary)] font-mono transition-colors"
												/>
												<Button
													type="submit"
													disabled={loading}
													className="font-mono text-xs shrink-0"
												>
													Analyze
												</Button>
											</form>
										</div>

										{/* Architecture Telemetry Pill */}
										<div className="bg-black/50 border border-white/[0.06] rounded-xl p-3.5 sm:p-4 text-xs space-y-2 font-mono">
											<div className="font-bold text-zinc-500 uppercase text-[10px] tracking-wider flex items-center justify-between">
												<span>Neural Pipeline</span>
												<span className="text-[var(--theme-primary)]">
													Online
												</span>
											</div>
											<div className="flex items-center justify-between text-zinc-300 text-[11px]">
												<span className="text-zinc-500">
													Multimodal VLM
												</span>
												<span className="text-[var(--theme-primary)] font-semibold">
													PaliGemma-3B
												</span>
											</div>
											<div className="flex items-center justify-between text-zinc-300 text-[11px]">
												<span className="text-zinc-500">
													Taxonomy Synthesizer
												</span>
												<span className="text-[var(--theme-primary)] font-semibold">
													Biology LLM
												</span>
											</div>
											<div className="flex items-center justify-between text-zinc-300 text-[11px]">
												<span className="text-zinc-500">
													WebGL Genetic Model
												</span>
												<span className="text-[var(--theme-primary)] font-semibold">
													Three.js 3D
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* HOLOGRAPHIC SCANNING ANIMATION STATE */}
								{loading && (
									<motion.div
										initial={{ opacity: 0, scale: 0.98 }}
										animate={{ opacity: 1, scale: 1 }}
										className="p-8 sm:p-12 text-center bg-[#121216]/40 backdrop-blur-2xl border border-[var(--theme-border)] rounded-3xl flex flex-col items-center justify-center relative overflow-hidden animate-glow-pulse"
									>
										{/* Laser scan line sweeping vertically */}
										<div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent shadow-[0_0_15px_var(--theme-primary)] animate-laser-scan" />

										{previewImage ? (
											<div className="w-32 h-32 rounded-xl overflow-hidden mb-4 border border-[var(--theme-border)] relative">
												<img
													src={previewImage}
													alt="Scanning specimen"
													className="w-full h-full object-cover opacity-60"
												/>
												<div className="absolute inset-0 bg-[var(--theme-primary-dim)]" />
											</div>
										) : (
											<div className="w-12 h-12 rounded-full border-2 border-[var(--theme-primary)] border-t-transparent animate-spin mb-4" />
										)}

										<div className="text-base font-bold text-white tracking-wide flex items-center gap-2">
											<Scan
												size={18}
												className="text-[var(--theme-primary)] animate-pulse"
											/>
											<span>
												Isolating Biological Matter...
											</span>
										</div>
										<div className="text-xs text-zinc-400 mt-1 font-mono max-w-sm">
											PaliGemma-3B is parsing structural
											morphology & phenotypic traits
										</div>
									</motion.div>
								)}

								{/* FULL RESULTS WORKSPACE */}
								{prediction && !loading && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5 }}
										className="space-y-5 sm:space-y-6"
									>
										{/* MASTER SPECIMEN CARD (Image on Left, Data on Right) */}
										<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 bg-[#121216]/40 backdrop-blur-2xl border border-[var(--theme-border)] rounded-3xl overflow-hidden relative shadow-[0_4px_35px_rgba(0,0,0,0.7)]">
											{/* Top Aesthetic Glow Line */}
											<div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent" />

											{/* Left: Scanned Specimen Thumbnail */}
											<div className="lg:col-span-4 p-5 sm:p-6 lg:border-r border-white/[0.08] flex flex-col items-center justify-center">
												<div className="w-full aspect-square max-w-[340px] rounded-xl overflow-hidden border border-white/10 relative group bg-black shadow-inner">
													{prediction.image_url ? (
														<img
															src={
																prediction.image_url
															}
															alt={
																prediction.label
															}
															className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center text-xs text-zinc-600 font-mono">
															No Optical Visual
														</div>
													)}
													<Badge
														variant="scientific"
														className="absolute top-3 right-3 bg-black/85 backdrop-blur-md"
													>
														Verified Specimen
													</Badge>
												</div>
											</div>

											{/* Right: Scientific Metadata & Confidence */}
											<div className="lg:col-span-8 p-5 sm:p-6 lg:p-8 flex flex-col justify-center">
												<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
													<div>
														{/* Decrypted Text Effect for Specimen Name */}
														<h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
															<DecryptedText
																text={
																	prediction.common_name ||
																	prediction.label
																}
																speed={25}
																maxIterations={
																	14
																}
															/>
														</h2>
														<div className="text-sm font-serif italic text-[var(--theme-primary)] mt-1 font-semibold">
															{
																prediction.scientific_name
															}
														</div>
													</div>
													<Badge
														variant="default"
														className="text-xs uppercase tracking-wider font-mono py-1 px-3 self-start"
													>
														{activeThemeMeta.title}
													</Badge>
												</div>

												{/* Confidence Meter */}
												<div className="mb-5 space-y-1.5">
													<div className="flex justify-between text-xs font-mono">
														<span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
															Cognitive Neural
															Confidence
														</span>
														<span className="text-[var(--theme-primary)] font-bold text-sm">
															{(
																prediction.confidence ||
																0
															).toFixed(1)}
															%
														</span>
													</div>
													<Progress
														value={Math.min(
															prediction.confidence ||
																0,
															100,
														)}
													/>
												</div>

												{/* Biological Overview Text */}
												<div className="bg-black/30 border border-white/[0.04] p-3.5 sm:p-4 rounded-xl">
													<h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono mb-1.5">
														Biological Synthesis
													</h4>
													<p className="text-xs text-zinc-300 leading-relaxed">
														{prediction.description}
													</p>
												</div>
											</div>
										</div>

										{/* GRID 2: TAXONOMY + 3D INTERACTIVE THREE.JS DNA */}
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
											{/* Taxonomic Classification Tree */}
											<Card className="border-[var(--theme-border)] bg-[#121216]/40 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
												<CardHeader className="pb-3 border-b border-white/[0.06]">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<Layers
																size={16}
																className="text-[var(--theme-primary)]"
															/>
															<CardTitle>
																Taxonomic
																Hierarchy
															</CardTitle>
														</div>
														<Badge variant="scientific">
															Linnaean Rank
														</Badge>
													</div>
												</CardHeader>
												<CardContent className="pt-4">
													<div className="divide-y divide-white/[0.05] text-xs font-mono">
														{prediction.taxonomy &&
														Object.keys(
															prediction.taxonomy,
														).length > 0 ? (
															Object.entries(
																prediction.taxonomy,
															).map(
																(
																	[
																		rank,
																		name,
																	],
																	i,
																) => (
																	<motion.div
																		key={i}
																		initial={{
																			opacity: 0,
																			x: -8,
																		}}
																		animate={{
																			opacity: 1,
																			x: 0,
																		}}
																		transition={{
																			delay:
																				i *
																				0.05,
																		}}
																		className="flex justify-between py-2.5"
																	>
																		<span className="text-zinc-500 capitalize font-medium">
																			{
																				rank
																			}
																		</span>
																		<span className="font-semibold text-zinc-200">
																			{String(
																				name,
																			)}
																		</span>
																	</motion.div>
																),
															)
														) : (
															<div className="text-xs text-zinc-500 py-4 font-mono">
																No taxonomic
																hierarchy
																returned.
															</div>
														)}
													</div>
												</CardContent>
											</Card>

											{/* Interactive 3D WebGL Helix with Mobile Touch & Theme Color */}
											<DNAHelix3D
												structure={
													prediction.genome
														?.structure_3d
												}
												themeColor={
													activeThemeMeta.primaryColor
												}
												genomeData={prediction.genome}
											/>
										</div>

										{/* GRID 3: SCIENTIFIC ECOLOGY & HABITAT MATRIX */}
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
											<motion.div
												whileHover={{ y: -3 }}
												transition={{ duration: 0.2 }}
											>
												<Card className="border-white/[0.06] hover:border-[var(--theme-border)] bg-[#121216]/40 backdrop-blur-2xl transition-colors h-full">
													<CardHeader className="pb-2">
														<div className="flex items-center gap-2 text-zinc-400">
															<Globe
																size={14}
																className="text-[var(--theme-primary)]"
															/>
															<CardTitle className="text-[11px]">
																Habitat & Range
															</CardTitle>
														</div>
													</CardHeader>
													<CardContent>
														<p className="text-xs text-zinc-300 leading-relaxed">
															{prediction.habitat ||
																"Information not specified."}
														</p>
													</CardContent>
												</Card>
											</motion.div>

											<motion.div
												whileHover={{ y: -3 }}
												transition={{ duration: 0.2 }}
											>
												<Card className="border-white/[0.06] hover:border-[var(--theme-border)] bg-[#121216]/40 backdrop-blur-2xl transition-colors h-full">
													<CardHeader className="pb-2">
														<div className="flex items-center gap-2 text-zinc-400">
															<Compass
																size={14}
																className="text-[var(--theme-primary)]"
															/>
															<CardTitle className="text-[11px]">
																Ecological Niche
															</CardTitle>
														</div>
													</CardHeader>
													<CardContent>
														<p className="text-xs text-zinc-300 leading-relaxed">
															{prediction.ecology ||
																"Information not specified."}
														</p>
													</CardContent>
												</Card>
											</motion.div>

											<motion.div
												whileHover={{ y: -3 }}
												transition={{ duration: 0.2 }}
											>
												<Card className="border-white/[0.06] hover:border-[var(--theme-border)] bg-[#121216]/40 backdrop-blur-2xl transition-colors h-full">
													<CardHeader className="pb-2">
														<div className="flex items-center gap-2 text-zinc-400">
															<Utensils
																size={14}
																className="text-[var(--theme-primary)]"
															/>
															<CardTitle className="text-[11px]">
																Diet & Foraging
															</CardTitle>
														</div>
													</CardHeader>
													<CardContent>
														<p className="text-xs text-zinc-300 leading-relaxed">
															{prediction.diet ||
																"Information not specified."}
														</p>
													</CardContent>
												</Card>
											</motion.div>

											<motion.div
												whileHover={{ y: -3 }}
												transition={{ duration: 0.2 }}
											>
												<Card className="border-white/[0.06] hover:border-[var(--theme-border)] bg-[#121216]/40 backdrop-blur-2xl transition-colors h-full">
													<CardHeader className="pb-2">
														<div className="flex items-center gap-2 text-zinc-400">
															<Binary
																size={14}
																className="text-[var(--theme-primary)]"
															/>
															<CardTitle className="text-[11px]">
																Survival
																Physiology
															</CardTitle>
														</div>
													</CardHeader>
													<CardContent>
														<p className="text-xs text-zinc-300 leading-relaxed">
															{prediction.survival ||
																"Information not specified."}
														</p>
													</CardContent>
												</Card>
											</motion.div>
										</div>
									</motion.div>
								)}
							</motion.div>
						)}

						{/* TAB: SCAN REGISTRY HISTORY */}
						{activeTab === "history" && (
							<motion.div
								key="tab-history"
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -12 }}
								transition={{ duration: 0.3 }}
								className="max-w-5xl mx-auto space-y-4"
							>
								<div className="flex items-center justify-between mb-4">
									<div>
										<h2 className="text-lg sm:text-xl font-bold text-white">
											Specimen Telemetry Archive
										</h2>
										<p className="text-xs text-zinc-400 font-mono">
											Cloud records synchronized from
											MongoDB Atlas cluster
										</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={loadHistory}
										className="font-mono text-xs"
									>
										<RefreshCw
											size={12}
											className="mr-1.5"
										/>
										Refresh
									</Button>
								</div>

								{historyList.length === 0 ? (
									<Card className="p-12 text-center text-xs text-zinc-500 font-mono bg-[#121216]/40 backdrop-blur-2xl border-white/[0.08]">
										No specimen scans registered in cluster.
										Ingest an image via Optical Sensor.
									</Card>
								) : (
									<div className="bg-[#121216]/40 backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden divide-y divide-white/[0.06]">
										{historyList.map((item, idx) => (
											<motion.div
												key={item._id || idx}
												whileHover={{
													backgroundColor:
														"rgba(255,255,255,0.03)",
												}}
												whileTap={{ scale: 0.99 }}
												className="p-4 flex items-center justify-between gap-4 transition-colors cursor-pointer"
												onClick={() => {
													setPrediction(
														item.prediction,
													);
													setActiveTab("scan");
												}}
											>
												<div className="flex items-center gap-3.5">
													<div
														className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center shrink-0"
														style={{
															color: detectSpeciesTheme(
																item.prediction,
															).primaryColor,
														}}
													>
														<Dna size={18} />
													</div>
													<div className="truncate">
														<div className="text-sm font-semibold text-white truncate">
															{item.prediction
																?.common_name ||
																item.prediction
																	?.label ||
																"Unknown"}
														</div>
														<div className="text-xs text-zinc-500 font-serif italic truncate">
															{
																item.prediction
																	?.scientific_name
															}
														</div>
													</div>
												</div>

												<div className="text-right font-mono shrink-0">
													<span
														className="text-xs font-bold"
														style={{
															color: detectSpeciesTheme(
																item.prediction,
															).primaryColor,
														}}
													>
														{(
															item.prediction
																?.confidence ||
															0
														).toFixed(1)}
														%
													</span>
													<div className="text-[10px] text-zinc-500 mt-0.5">
														{new Date(
															item.timestamp,
														).toLocaleDateString()}
													</div>
												</div>
											</motion.div>
										))}
									</div>
								)}
							</motion.div>
						)}

						{/* TAB: AUTHENTICATION */}
						{activeTab === "auth" && (
							<motion.div
								key="tab-auth"
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -12 }}
								transition={{ duration: 0.3 }}
								className="max-w-md mx-auto pt-4 sm:pt-8"
							>
								<Card className="border-[var(--theme-border)] bg-[#121216]/40 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
									<CardHeader>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-xl bg-[var(--theme-primary-dim)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)]">
												<Shield size={20} />
											</div>
											<div>
												<h3 className="text-base font-bold text-white">
													{isRegisterMode
														? "Register Scientific Identity"
														: "Authorize Researcher"}
												</h3>
												<p className="text-xs text-zinc-500 font-mono">
													Secure session tokens via
													MongoDB Atlas
												</p>
											</div>
										</div>
									</CardHeader>

									<CardContent>
										{authMsg && (
											<div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/40 rounded-lg text-xs text-rose-300 font-mono">
												{authMsg}
											</div>
										)}

										<form
											onSubmit={handleAuthSubmit}
											className="space-y-4"
										>
											<div>
												<label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-bold mb-1">
													Researcher Email
												</label>
												<input
													type="email"
													required
													value={authEmail}
													onChange={(e) =>
														setAuthEmail(
															e.target.value,
														)
													}
													placeholder="researcher@biodex.org"
													className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--theme-primary)] font-mono"
												/>
											</div>

											<div>
												<label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-bold mb-1">
													Security Credential
												</label>
												<input
													type="password"
													required
													value={authPass}
													onChange={(e) =>
														setAuthPass(
															e.target.value,
														)
													}
													placeholder="••••••••••••"
													className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--theme-primary)] font-mono"
												/>
											</div>

											<Button
												type="submit"
												className="w-full uppercase font-mono tracking-wider text-xs py-2.5"
											>
												{isRegisterMode
													? "Generate Identity"
													: "Authorize Access"}
											</Button>
										</form>

										<div className="mt-6 text-center text-xs text-zinc-500 font-mono">
											{isRegisterMode
												? "Already possess security access?"
												: "Need an assigned identity?"}{" "}
											<button
												onClick={() =>
													setIsRegisterMode(
														!isRegisterMode,
													)
												}
												className="text-[var(--theme-primary)] hover:underline font-semibold ml-1"
											>
												{isRegisterMode
													? "Sign in"
													: "Register"}
											</button>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</main>

			{/* MOBILE BOTTOM NAVIGATION DOCK (Sticky on mobile, hidden on lg screens) */}
			<nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-[#101014]/40 border-t border-white/[0.08] backdrop-blur-2xl px-4 flex items-center justify-around pb-safe">
				<button
					onClick={() => setActiveTab("scan")}
					className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
						activeTab === "scan"
							? "text-[var(--theme-primary)] font-bold"
							: "text-zinc-500 hover:text-zinc-300"
					}`}
				>
					<Camera size={18} />
					<span className="text-[10px] font-mono">Analyzer</span>
				</button>

				<button
					onClick={() => setActiveTab("history")}
					className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
						activeTab === "history"
							? "text-[var(--theme-primary)] font-bold"
							: "text-zinc-500 hover:text-zinc-300"
					}`}
				>
					<History size={18} />
					<span className="text-[10px] font-mono">Archive</span>
				</button>

				<button
					onClick={() => setActiveTab("auth")}
					className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
						activeTab === "auth"
							? "text-[var(--theme-primary)] font-bold"
							: "text-zinc-500 hover:text-zinc-300"
					}`}
				>
					<Shield size={18} />
					<span className="text-[10px] font-mono">
						{userEmail ? "Account" : "Auth"}
					</span>
				</button>
			</nav>
		</div>
	);
}
