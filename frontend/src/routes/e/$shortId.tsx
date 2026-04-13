/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <useEffect> */
/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { CheckIcon, LinkIcon, PenBoxIcon, PencilIcon, UsersRound, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { GoogleIcon } from "../../components/icons/GoogleIcon";
import { GradientIcon } from "../../components/icons/GradientIcon";
import { Button } from "../../components/ui/button";
import { dateFnsLocale } from "../../components/ui/pages/create/calendar/Calendar";
import { Skeleton } from "../../components/ui/skeleton";
import { UserButton } from "../../components/ui/UserButton";
import { useLogin } from "../../hooks/mutation/useLogin";
import { useGetEvent } from "../../hooks/query/useGetEvent";
import { useGetMe } from "../../hooks/query/useGetMe";
import { cn } from "../../lib/utils";
import type { SummarySlot } from "../../mocks/types";
import { m } from "../../paraglide/messages";
import { getLocale } from "../../paraglide/runtime";

export const Route = createFileRoute("/e/$shortId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { shortId } = Route.useParams();
	const { data: event, isLoading } = useGetEvent(shortId);
	const { data: me } = useGetMe();
	const { mutate: login } = useLogin();

	const heatMapTimes = new Set<string>();
	const heatMapDates = new Set<string>();
	const heatMapSlots = new Map<string, SummarySlot>();

	for (const time of event?.details.times ?? []) {
		const [_time, date] = time.split("-");
		heatMapTimes.add(_time);
		heatMapDates.add(date);
	}

	for (const slot of event?.summary.slots ?? []) {
		heatMapSlots.set(slot.slot, slot);
	}

	const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
	const [isSelectMode, setIsSelectMode] = useState(false);
	const isDragging = useRef(false);
	const visitedSlots = useRef(new Set<string>());

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

	const allSlots = event?.details.times ?? [];
	const handleSelectAll = () => setSelectedSlots(allSlots);
	const handleDeselectAll = () => setSelectedSlots([]);

	useEffect(() => {
		if (me) {
			const currentUserSlots = event?.summary.users.find(user => user.user.id === me.id);
			if (currentUserSlots) {
				setSelectedSlots(() => currentUserSlots?.available);
			}
		}
	}, [me, event]);

	return (
		<main className="max-w-md m-auto pt-5 px-4 sm:px-0">
			{/* navbar */}
			<div className="flex flex-row justify-between mb-12">
				<div>
					{isLoading ? (
						<Skeleton className="h-9 w-48 mb-2" />
					) : (
						<p className="text-3xl mb-2 font-viking">{event?.details.name}</p>
					)}
					<Button size="xs" onClick={() => toast.success("Link copied!")}>
						<LinkIcon className="size-5" />
					</Button>
				</div>
				<div>
					<UserButton />
				</div>
			</div>
			{/* welcome */}
			{me ? (
				// <div className="p-4 mb-12 rounded-2xl bg-linear-to-tr from-primary from-5% to-secondary">
				// 	<p className="text-sm">Welcome, {me?.name}! or sync with google.</p>
				// </div>
				<div></div>
			) : (
				<div className="bg-canvas rounded-2xl p-8 flex flex-col items-center mb-8">
					<p className="text-2xl mb-8">{m.event_sign_in_title()}</p>
					<div className="mb-8">
						<Button onClick={() => login()} className="px-8">
							<GoogleIcon className="size-8 mr-3" />
							{m.create_continue_with_google()}
						</Button>
					</div>
					<p className="text-info text-center">{m.create_google_calendar_hint_1()}</p>
					<p className="text-info text-center -mt-1">{m.create_google_calendar_hint_2()}</p>
				</div>
			)}

			{/* participants */}
			<div className="mb-12">
				<div className="flex flex-row items-start mb-4">
					<GradientIcon icon={UsersRound} className="size-6 mr-2.5" />
					<div className="flex flex-row justify-between">
						<div>
							<p className="text-xl">{m.event_participants_title()}</p>
							<p className="text-info text-sm">{m.event_participants_text()}</p>
						</div>
						{isLoading ? (
							<Skeleton className="h-7 w-6 ml-6" />
						) : (
							<p className="text-xl ml-6">{event?.summary.users.length}</p>
						)}
					</div>
				</div>
				<div className="bg-canvas p-5 rounded-2xl space-y-4">
					{isLoading ? (
						// biome-ignore lint/complexity/noUselessFragments: <this is needed>
						<>
							{[...Array(3)].map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <this is just skeleton>
								<div key={i} className="flex flex-row">
									<Skeleton className="size-8 rounded-full mr-3 shrink-0" />
									<div className="flex flex-col gap-1">
										<Skeleton className="h-7 w-32" />
										<Skeleton className="h-4 w-20" />
									</div>
								</div>
							))}
						</>
					) : (
						event?.summary.users.map(({ user, available }) => (
							<div key={user.id} className="flex flex-row">
								<div className="mr-3">
									{user.profilePicture ? (
										<img src={user.profilePicture} alt="PP" className="rounded-full size-8" />
									) : (
										<div className="bg-linear-to-tr from-primary from-5% to-secondary rounded-full text-center size-8">
											<p className="">{user.name.slice(0, 1)}</p>
										</div>
									)}
								</div>
								<div>
									<p className="text-xl">{user.name}</p>
									<p className="text-sm text-info">
										{m.event_time_slots({ count: available.length })}
									</p>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* heatmap info */}
			{isLoading ? (
				<Skeleton className="h-12 w-full" />
			) : (
				<div className="mb-12 flex flex-row font-semibold">
					<p className="flex-nowrap shrink-0 mr-2 font-number">
						0 / {event?.summary.users.length} {m.event_heatmap_info()}
					</p>
					{[...Array(event?.summary.users.length! + 1)].map((_, count) => (
						<div
							key={count}
							className={cn(
								"rounded-lg w-full text-center",
								count === 0 ? "bg-paint" : "bg-primary",
								count === event?.summary.users.length &&
									"border border-amber-300 shadow-sm shadow-amber-300",
							)}
							style={{
								opacity: count > 0 ? count / (event?.summary.users.length || 1) : 1,
							}}
						>
							<p className="font-number">{count}</p>
						</div>
					))}
					<p className="flex-nowrap shrink-0 ml-2 font-number">
						{event?.summary.users.length} / {event?.summary.users.length} {m.event_heatmap_info()}
					</p>
				</div>
			)}

			<div className="mb-6">
				<div className="flex flex-row items-start">
					<GradientIcon icon={PenBoxIcon} className="size-6 mr-2.5" />
					<div>
						<p className="text-lg">{m.event_mark_availability_title()}</p>
						<p className="text-info text-sm">{m.event_mark_availability_text()}</p>
					</div>
				</div>
			</div>
			{/* {me && (
				<div className="mb-6 flex justify-center">
					<Button onClick={() => {}} className="px-8">
						<GoogleIcon className="size-8 mr-3" />
						Sync with Google Calendar
					</Button>
				</div>
			)} */}

			{/* heatmap */}
			{me && (
				<div className="flex flex-row gap-2 mb-3 justify-center">
					<Button size="xs" onClick={handleSelectAll}>
						{m.event_select_all()}
					</Button>
					<Button size="xs" variant="red" onClick={handleDeselectAll}>
						{m.event_deselect_all()}
					</Button>
				</div>
			)}
			<div
				className="p-4 bg-canvas rounded-2xl overflow-x-scroll -ml-6 -mr-20 max-w-min mb-28"
				style={{ touchAction: isSelectMode ? "none" : "auto" }}
				onPointerDown={e => {
					if (!isSelectMode) return;
					isDragging.current = true;
					visitedSlots.current.clear();
					(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
				}}
				onPointerMove={e => {
					if (!isDragging.current || !isSelectMode) return;
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
				<div className="flex flex-row">
					<div className="w-16 shrink-0" />
					{Array.from(heatMapDates.values()).map(heatMapDate => {
						const date = new Date(
							parseInt(heatMapDate.slice(5, 8)),
							parseInt(heatMapDate.slice(3, 5)) - 1,
							parseInt(heatMapDate.slice(0, 2)),
						);

						return (
							<button
								type="button"
								className={cn(
									"w-12 mx-0.5 shrink-0",
									me ? "cursor-pointer" : "cursor-default pointer-events-none opacity-50",
								)}
								key={heatMapDate}
								onClick={() => toggleColumn(heatMapDate)}
							>
								<p className="text-nowrap text-center">
									<span className="font-semibold">
										{(() => {
											const dayName = format(date, "EEE", { locale: dateFnsLocale });
											return dayName.charAt(0).toUpperCase() + dayName.slice(1, 3).toLowerCase();
										})()}
									</span>
									<br />
									<span className="text-[#BABABA]">
										{(() => {
											const month = format(date, "MMM", {
												locale: dateFnsLocale,
											});
											const day = format(date, "d");
											const shortMonth =
												month.charAt(0).toUpperCase() +
												month.slice(1, getLocale() === "et" ? 4 : 3);
											return `${shortMonth} ${day}`;
										})()}
									</span>
								</p>
							</button>
						);
					})}
				</div>
				<div>
					{Array.from(heatMapTimes).map((heatMapTime, index) => (
						<div key={heatMapTime + index} className="flex flex-row">
							{/* time on the left */}
							<button
								type="button"
								className={cn(
									"text-lg font-semibold absolute -mt-1 z-10 bg-canvas px-2 rounded-2xl",
									me ? "cursor-pointer" : "cursor-default pointer-events-none opacity-50",
								)}
								onClick={() => toggleRow(heatMapTime)}
							>
								{heatMapTime.slice(0, 2)}:{heatMapTime.slice(2, 4)}
							</button>
							{/* line separator between times. will leave it here as i don't know if I will use it */}
							{/* <div className="w-full border absolute z-10 border-[#686868]"/>*/}
							<div className="w-16 shrink-0" />
							{Array.from(heatMapDates.values()).map(heatMapDate => {
								const realSlot = `${heatMapTime}-${heatMapDate}`;

								const slot = heatMapSlots.get(realSlot);
								const count = slot?.count ?? 0;

								const wasInServer = slot?.users.some(u => u.id === me?.id);
								const isInLocal = selectedSlots?.includes(realSlot);

								const displayCount =
									count + (isInLocal && !wasInServer ? 1 : 0) - (!isInLocal && wasInServer ? 1 : 0);

								const hasMaxVotes = displayCount === event?.summary.users.length;
								return (
									<button
										type="button"
										key={realSlot}
										data-slot={realSlot}
										className="relative w-12 h-12 shrink-0 m-0.5"
										disabled={!me}
										onClick={() =>
											setSelectedSlots(prev => {
												const isAlreadyChecked = prev?.find(prevSlot => prevSlot === realSlot);

												if (isAlreadyChecked) {
													return prev?.filter(_slot => _slot !== realSlot);
												}

												return [...prev, realSlot] as string[];
											})
										}
									>
										<div
											className={cn(
												"absolute inset-0 rounded-xl",
												displayCount === 0 ? "bg-paint" : "bg-primary",
												hasMaxVotes && "border border-amber-300 shadow-sm shadow-amber-300",
											)}
											style={{
												opacity:
													displayCount > 0 ? displayCount / (event?.summary.users.length || 1) : 1,
											}}
										>
											{me?.id && isInLocal && (
												<CheckIcon className="absolute inset-0 size-6 m-auto" />
											)}
										</div>
									</button>
								);
							})}
						</div>
					))}
				</div>
			</div>
			{me && (
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
					<Button
						onClick={() => setIsSelectMode(prev => !prev)}
						className="flex flex-row items-center gap-2 shadow-md px-5 py-3 rounded-full"
					>
						{isSelectMode ? (
							<>
								<XIcon className="size-5" />
								<span className="text-sm font-semibold">{m.event_select_mode()}</span>
							</>
						) : (
							<PencilIcon className="size-5" />
						)}
					</Button>
				</div>
			)}
		</main>
	);
}
