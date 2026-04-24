/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <useEffect> */
/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { createFileRoute } from "@tanstack/react-router";
import { UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { GoogleIcon } from "../../components/icons/GoogleIcon";
import { GradientIcon } from "../../components/icons/GradientIcon";
import { Button } from "../../components/ui/button";
import { CopyLinkButton } from "../../components/ui/CopyLinkButton";
import { HeatmapTabs } from "../../components/ui/pages/event/HeatmapTabs";
import { Skeleton } from "../../components/ui/skeleton";
import { UserButton } from "../../components/ui/UserButton";
import { useGoogleAuth } from "../../hooks/mutation/useGoogleAuth";
import { useRespondToEvent } from "../../hooks/mutation/useRespondToEvent";
import { useGetEvent } from "../../hooks/query/useGetEvent";
import { useGetMe } from "../../hooks/query/useGetMe";
import { cn } from "../../lib/utils";
import { m } from "../../paraglide/messages";

export const Route = createFileRoute("/e/$shortId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { shortId } = Route.useParams();
	const { data: event, isLoading } = useGetEvent(shortId);
	const { data: me } = useGetMe();
	const handleLogin = useGoogleAuth();
	const { mutate: respond, isPending: isSaving } = useRespondToEvent(shortId);

	const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

	const handleSave = () => {
		const allTimes = event?.details.times ?? [];
		respond({
			shortId,
			available: selectedSlots,
			notAvailable: allTimes.filter((time: string) => !selectedSlots.includes(time)),
		});
	};

	useEffect(() => {
		if (me) {
			const currentUserSlots = event?.summary.users?.find(user => user.user?.id === me.id);
			if (currentUserSlots) {
				setSelectedSlots(currentUserSlots.available ?? []);
			}
		}
	}, [me, event]);

	if (!event) {
		return <p>Not found</p>;
	}

	return (
		<main className="max-w-md m-auto pt-5 px-4 sm:px-0">
			{/* navbar */}
			<div className="flex flex-row justify-between mb-12 mx-4">
				<div>
					{isLoading ? (
						<Skeleton className="h-9 w-48 mb-2" />
					) : (
						<p className="text-3xl mb-2 font-viking">{event?.details.name}</p>
					)}

					<CopyLinkButton shortId={shortId} />
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
						<Button onClick={handleLogin} className="px-8">
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
							<p className="text-xl ml-6">{event?.summary.users?.length}</p>
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
						event?.summary.users?.map(({ user, available }) => (
							<div key={user?.id} className="flex flex-row">
								<div className="mr-3">
									{user?.profilePicture ? (
										<img src={user.profilePicture} alt="PP" className="rounded-full size-8" />
									) : (
										<div className="bg-linear-to-tr from-primary from-5% to-secondary rounded-full text-center size-8">
											<p className="">{user?.name?.slice(0, 1)}</p>
										</div>
									)}
								</div>
								<div>
									<p className="text-xl">{user?.name}</p>
									<p className="text-sm text-info">
										{m.event_time_slots({ count: available?.length ?? 0 })}
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
						0 / {event?.summary.users?.length} {m.event_heatmap_info()}
					</p>
					{[...Array(event?.summary.users?.length! + 1)].map((_, count) => (
						<div
							key={count}
							className={cn(
								"rounded-lg w-full text-center",
								count === 0 ? "bg-paint" : "bg-primary",
								count === event?.summary.users?.length &&
									"border border-amber-300 shadow-sm shadow-amber-300",
							)}
							style={{
								opacity: count > 0 ? count / (event?.summary.users?.length || 1) : 1,
							}}
						>
							<p className="font-number">{count}</p>
						</div>
					))}
					<p className="flex-nowrap shrink-0 ml-2 font-number">
						{event?.summary.users?.length} / {event?.summary.users?.length} {m.event_heatmap_info()}
					</p>
				</div>
			)}

			<HeatmapTabs
				shortId={shortId}
				selectedSlots={selectedSlots}
				setSelectedSlots={setSelectedSlots}
				onSave={handleSave}
				isSaving={isSaving}
			/>
		</main>
	);
}
