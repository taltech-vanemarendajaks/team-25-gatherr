/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { format } from "date-fns";
import { CheckIcon, PenBoxIcon, PencilIcon, XIcon } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { useRef, useState } from "react";
import { useGetEvent } from "../../../../hooks/query/useGetEvent";
import { useGetMe } from "../../../../hooks/query/useGetMe";
import { cn } from "../../../../lib/utils";
import type { SummarySlot } from "../../../../mocks/types";
import { m } from "../../../../paraglide/messages";
import { getLocale } from "../../../../paraglide/runtime";
import { GradientIcon } from "../../../icons/GradientIcon";
import { Button } from "../../button";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs";
import { useIsMobile } from "../../useIsMobile";
import { dateFnsLocale } from "../create/calendar/Calendar";

interface TwoElementMovingBoxProps {
	selectedIndex: number;
	duration?: number;
}

const TwoElementMovingBox = ({ selectedIndex, duration = 0.4 }: TwoElementMovingBoxProps) => {
	const whiteMovingBox: Variants = {
		active: {
			left: "0%",
			transition: { ease: "easeOut", duration },
		},
		inactive: {
			left: "50%",
			transition: { ease: "easeOut", duration },
		},
	};
	return (
		<motion.div
			variants={whiteMovingBox}
			animate={selectedIndex === 0 ? "active" : "inactive"}
			className="bg-primary absolute inset-0 w-[50%] rounded-2xl shadow-lg/60 shadow-amber-900 pointer-events-none"
		/>
	);
};

interface Props {
	shortId: string;
	selectedSlots: string[];
	setSelectedSlots: React.Dispatch<React.SetStateAction<string[]>>;
	onSave: () => void;
	isSaving: boolean;
}

export const HeatmapTabs = ({
	shortId,
	selectedSlots,
	setSelectedSlots,
	onSave,
	isSaving,
}: Props) => {
	const { data: event } = useGetEvent(shortId);
	const { data: me } = useGetMe();

	const { isMobile } = useIsMobile();
	const [selectedIndex, setSelectedIndex] = useState(me ? 0 : 1);
	const [isSelectMode, setIsSelectMode] = useState(false);
	const canDrag = !isMobile || isSelectMode;
	const [openSlot, setOpenSlot] = useState<string | null>(null);
	const isDragging = useRef(false);
	const visitedSlots = useRef(new Set<string>());

	const uniqueTimes = new Set<string>();
	const uniqueDates = new Set<string>();
	const heatMapSlots = new Map<string, SummarySlot>();

	for (const time of event?.details.times ?? []) {
		const [_time, date] = time.split("-");
		uniqueTimes.add(_time);
		uniqueDates.add(date);
	}

	for (const slot of event?.summary.slots ?? []) {
		heatMapSlots.set(slot.slot, slot);
	}

	const heatMapTimes = Array.from(uniqueTimes).sort();
	const heatMapDates = Array.from(uniqueDates).sort((a, b) => {
		const sortableA = a.slice(4, 8) + a.slice(2, 4) + a.slice(0, 2);
		const sortableB = b.slice(4, 8) + b.slice(2, 4) + b.slice(0, 2);
		return sortableA.localeCompare(sortableB);
	});

	const toggleRow = (time: string) => {
		const rowSlots = Array.from(heatMapDates).map(date => `${time}-${date}`);
		const allSelected = rowSlots.every(slot => selectedSlots.includes(slot));
		setSelectedSlots(prev =>
			allSelected
				? prev.filter(slot => !rowSlots.includes(slot))
				: [...new Set([...prev, ...rowSlots])],
		);
	};

	const toggleColumn = (date: string) => {
		const colSlots = Array.from(heatMapTimes).map(time => `${time}-${date}`);
		const allSelected = colSlots.every(slot => selectedSlots.includes(slot));
		setSelectedSlots(prev =>
			allSelected
				? prev.filter(slot => !colSlots.includes(slot))
				: [...new Set([...prev, ...colSlots])],
		);
	};

	const handleSelectAll = () => setSelectedSlots(event?.details.times ?? []);
	const handleDeselectAll = () => setSelectedSlots([]);

	return (
		<>
			<Tabs
				value={selectedIndex === 0 ? "yours" : "group"}
				onValueChange={value => {
					setSelectedIndex(value === "yours" ? 0 : 1);
					setIsSelectMode(false);
					setOpenSlot(null);
				}}
			>
				<div className="bg-canvas p-2 rounded-xl max-w-xl m-auto mb-6">
					<TabsList>
						<TabsTrigger value="yours">{m.event_tab_yours()}</TabsTrigger>
						<TabsTrigger value="group">{m.event_tab_group()}</TabsTrigger>
						<TwoElementMovingBox selectedIndex={selectedIndex} />
					</TabsList>
				</div>

				{/* your availability tab */}
				<TabsContent value="yours">
					<div className="mb-6">
						<div className="flex flex-row items-start">
							<GradientIcon icon={PenBoxIcon} className="size-6  min-w-6 mr-2.5" />
							<div>
								<p className="text-lg">{m.event_mark_availability_title()}</p>
								<p className="text-info text-sm">{m.event_mark_availability_text()}</p>
							</div>
						</div>
					</div>

					{me && (
						<div className="flex flex-row gap-2 mb-3 justify-center">
							<Button size="xs" onClick={handleSelectAll}>
								{m.event_select_all()}
							</Button>
							<Button size="xs" variant="red" onClick={handleDeselectAll}>
								{m.event_deselect_all()}
							</Button>
							<Button
								size="xs"
								onClick={() => {
									onSave();
									setSelectedIndex(1);
								}}
								disabled={isSaving}
							>
								{m.event_save()}
							</Button>
						</div>
					)}

					<div className="overflow-x-auto w-full mb-28">
						<div
							className="p-4 bg-canvas rounded-2xl w-max mx-auto"
							style={{ touchAction: isSelectMode && isMobile ? "none" : "auto" }}
							onPointerDown={e => {
								if (!canDrag) return;
								const el = document.elementFromPoint(e.clientX, e.clientY);
								if (!el?.closest("[data-slot]")) return;
								isDragging.current = true;
								visitedSlots.current.clear();
								(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
							}}
							onPointerMove={e => {
								if (!isDragging.current || !canDrag) return;
								const el = document.elementFromPoint(e.clientX, e.clientY);
								const slot = el?.closest("[data-slot]")?.getAttribute("data-slot");
								if (!slot || visitedSlots.current.has(slot)) return;
								visitedSlots.current.add(slot);
								setSelectedSlots(prev =>
									prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot],
								);
							}}
							onPointerUp={() => {
								isDragging.current = false;
								visitedSlots.current.clear();
							}}
							onPointerCancel={() => {
								isDragging.current = false;
								visitedSlots.current.clear();
							}}
						>
							{/* date headers */}
							<div className="flex flex-row mb-6">
								<div className="w-16 shrink-0 mb-6" />
								{Array.from(heatMapDates.values()).map(heatMapDate => {
									const date = new Date(
										parseInt(heatMapDate.slice(4, 8)),
										parseInt(heatMapDate.slice(2, 4)) - 1,
										parseInt(heatMapDate.slice(0, 2)),
									);
									return (
										<Button
											variant="dark"
											type="button"
											size="xs"
											className={cn(
												"w-12 mx-0.5 shrink-0",
												me ? "cursor-pointer" : "cursor-default pointer-events-none opacity-50",
											)}
											key={heatMapDate}
											onClick={() => toggleColumn(heatMapDate)}
										>
											<p className="text-nowrap text-center">
												<span className="font-semibold text-md">
													{(() => {
														const dayName = format(date, "EEE", { locale: dateFnsLocale });
														return (
															dayName.charAt(0).toUpperCase() + dayName.slice(1, 3).toLowerCase()
														);
													})()}
												</span>
												<br />
												<span className="text-[#BABABA] text-xs">
													{(() => {
														const month = format(date, "MMM", { locale: dateFnsLocale });
														const day = format(date, "d");
														const shortMonth =
															month.charAt(0).toUpperCase() +
															month.slice(1, getLocale() === "et" ? 4 : 3);
														return `${shortMonth} ${day}`;
													})()}
												</span>
											</p>
										</Button>
									);
								})}
							</div>

							{/* time rows */}
							<div>
								{Array.from(heatMapTimes).map((heatMapTime, index) => (
									<div key={heatMapTime + index} className="flex flex-row">
										{/* time on the left */}
										<Button
											variant="dark"
											type="button"
											size="xs"
											className={cn(
												"absolute -mt-3! px-2 py-1 rounded-2xl z-50",
												me ? "cursor-pointer" : "cursor-default pointer-events-none opacity-50",
											)}
											onClick={() => toggleRow(heatMapTime)}
										>
											{heatMapTime.slice(0, 2)}:{heatMapTime.slice(2, 4)}
										</Button>
										{/* line separator between times. will leave it here as i don't know if I will use it */}
										{/* <div className="w-full border absolute z-10 border-[#686868]"/>*/}
										<div className="w-16 shrink-0" />
										{Array.from(heatMapDates.values()).map(heatMapDate => {
											const realSlot = `${heatMapTime}-${heatMapDate}`;
											const isInLocal = selectedSlots.includes(realSlot);

											return (
												<button
													type="button"
													key={realSlot}
													data-slot={realSlot}
													className="relative w-12 h-12 shrink-0 m-0.5 overflow-hidden rounded-xl"
													disabled={!me}
													onClick={() =>
														setSelectedSlots(prev =>
															prev.includes(realSlot)
																? prev.filter(s => s !== realSlot)
																: [...prev, realSlot],
														)
													}
												>
													<div className="absolute inset-0 rounded-xl bg-paint" />
													<motion.span
														initial={false}
														animate={{
															scale: isInLocal ? 1.5 : 0,
															opacity: isInLocal ? 1 : 0,
														}}
														transition={{
															type: "spring",
															stiffness: 300,
															damping: 30,
														}}
														className="absolute inset-0 pointer-events-none rounded-xl bg-primary"
														style={{ originX: 0.5, originY: 0.5 }}
													/>
													{me?.id && isInLocal && (
														<CheckIcon className="absolute inset-0 size-6 m-auto z-10" />
													)}
												</button>
											);
										})}
									</div>
								))}
							</div>
						</div>
					</div>
				</TabsContent>

				{/* group availability tab */}
				<TabsContent value="group">
					<div className="mb-6">
						<div className="flex flex-row items-start">
							<GradientIcon icon={PenBoxIcon} className="size-6 mr-2.5" />
							<div>
								<p className="text-lg">{m.event_group_availability_title()}</p>
								<p className="text-info text-sm">{m.event_group_availability_text()}</p>
							</div>
						</div>
					</div>

					<div className="overflow-x-auto w-full mb-6">
						<div className="p-4 bg-canvas rounded-2xl w-max mx-auto">
							{/* date headers */}
							<div className="flex flex-row">
								<div className="w-16 shrink-0" />
								{Array.from(heatMapDates.values()).map(heatMapDate => {
									const date = new Date(
										parseInt(heatMapDate.slice(4, 8)),
										parseInt(heatMapDate.slice(2, 4)) - 1,
										parseInt(heatMapDate.slice(0, 2)),
									);
									return (
										<div className="w-12 mx-0.5 shrink-0" key={heatMapDate}>
											<p className="text-nowrap text-center">
												<span className="font-semibold">
													{(() => {
														const dayName = format(date, "EEE", { locale: dateFnsLocale });
														return (
															dayName.charAt(0).toUpperCase() + dayName.slice(1, 3).toLowerCase()
														);
													})()}
												</span>
												<br />
												<span className="text-[#BABABA]">
													{(() => {
														const month = format(date, "MMM", { locale: dateFnsLocale });
														const day = format(date, "d");
														const shortMonth =
															month.charAt(0).toUpperCase() +
															month.slice(1, getLocale() === "et" ? 4 : 3);
														return `${shortMonth} ${day}`;
													})()}
												</span>
											</p>
										</div>
									);
								})}
							</div>

							{/* time rows */}
							<div>
								{Array.from(heatMapTimes).map((heatMapTime, index) => (
									<div key={heatMapTime + index} className="flex flex-row">
										<p className="text-lg font-semibold absolute -mt-1 z-10 bg-canvas px-2 rounded-2xl">
											{heatMapTime.slice(0, 2)}:{heatMapTime.slice(2, 4)}
										</p>
										<div className="w-16 shrink-0" />
										{Array.from(heatMapDates.values()).map(heatMapDate => {
											const realSlot = `${heatMapTime}-${heatMapDate}`;
											const slot = heatMapSlots.get(realSlot);
											const count = slot?.count ?? 0;
											const hasMaxVotes = count === event?.summary.users.length;

											return (
												<Popover
													key={realSlot}
													open={openSlot === realSlot}
													onOpenChange={open => setOpenSlot(open ? realSlot : null)}
												>
													<PopoverTrigger asChild>
														<button
															type="button"
															className="relative w-12 h-12 shrink-0 m-0.5"
															onClick={() =>
																setOpenSlot(prev => (prev === realSlot ? null : realSlot))
															}
														>
															<div
																className={cn(
																	"absolute inset-0 rounded-xl",
																	count === 0 ? "bg-paint" : "bg-primary",
																	hasMaxVotes &&
																		"border border-amber-300 shadow-sm shadow-amber-300",
																)}
																style={{
																	opacity:
																		count > 0 ? count / (event?.summary.users.length || 1) : 1,
																}}
															/>
														</button>
													</PopoverTrigger>
													<PopoverContent className="w-auto min-w-28 p-4">
														<p className="text-lg font-semibold mb-1 text-center">
															{heatMapTime.slice(0, 2)}:{heatMapTime.slice(2, 4)},{" "}
															{format(
																new Date(
																	parseInt(heatMapDate.slice(4, 8)),
																	parseInt(heatMapDate.slice(2, 4)) - 1,
																	parseInt(heatMapDate.slice(0, 2)),
																),
																"EEEE",
																{ locale: dateFnsLocale },
															)}
														</p>
														<p className="flex-nowrap shrink-0 ml-2 font-number font-semibold text-center mb-4">
															{slot?.users.length || 0} / {event?.summary.users.length}{" "}
															{m.event_heatmap_info()}
														</p>
														{slot && slot.users.length > 0 && (
															<div className="flex flex-col gap-1 text-center">
																{slot.users.map(user => (
																	<p key={user.id} className="text-sm">
																		{user.name}
																	</p>
																))}
															</div>
														)}
													</PopoverContent>
												</Popover>
											);
										})}
									</div>
								))}
							</div>
						</div>
					</div>
				</TabsContent>
			</Tabs>

			{/* fixed mode toggle — only visible on yours tab on mobile */}
			{me && selectedIndex === 0 && isMobile && (
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
					<Button
						onClick={() => setIsSelectMode(prev => !prev)}
						className="flex flex-row items-center gap-2 shadow-md px-5 py-3 rounded-full"
					>
						{isSelectMode ? (
							<>
								<XIcon className="size-5" />
								<span className="text-sm font-semibold">{m.event_enable_scrolling()}</span>
							</>
						) : (
							<>
								<PencilIcon className="size-5" />
								<span className="text-sm font-semibold">{m.event_enable_dragging()}</span>
							</>
						)}
					</Button>
				</div>
			)}
		</>
	);
};
