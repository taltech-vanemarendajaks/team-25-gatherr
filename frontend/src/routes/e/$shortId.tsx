import { createFileRoute } from "@tanstack/react-router";
import { LinkIcon, PenBoxIcon, UsersRound } from "lucide-react";
import { GoogleIcon } from "../../components/icons/GoogleIcon";
import { GradientIcon } from "../../components/icons/GradientIcon";
import { Button } from "../../components/ui/button";
import { UserButton } from "../../components/ui/UserButton";
import { useGetEvent } from "../../hooks/query/useGetEvent";
import { useGetMe } from "../../hooks/query/useGetMe";
import { m } from "../../paraglide/messages";

export const Route = createFileRoute("/e/$shortId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { shortId } = Route.useParams();
	const { data: event } = useGetEvent(shortId);
	const { data: me } = useGetMe();

	return (
		<main className="max-w-md m-auto pt-5 px-4 sm:px-0">
			{/* navbar */}
			<div className="flex flex-row justify-between mb-12">
				<div>
					<p className="text-3xl mb-2">{event?.details.name}</p>
					<Button size="xs">
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
						<Button onClick={() => {}} className="px-8">
							<GoogleIcon className="size-8 mr-3" />
							{m.create_continue_with_google()}
						</Button>
					</div>
					<p className="text-info text-center">{m.create_google_calendar_hint_1()}</p>
					<p className="text-info text-center -mt-1">{m.create_google_calendar_hint_2()}</p>
				</div>
			)}

			{/* heatmap */}
			<div className="mb-6">
				<div className="flex flex-row items-start">
					<GradientIcon icon={PenBoxIcon} className="size-6 mr-2.5" />
					<div>
						<p className="text-lg">{m.event_mark_availability_title()}</p>
						<p className="text-info text-sm">{m.event_mark_availability_text()}</p>
					</div>
				</div>
				<div>Heatmap</div>
			</div>
			{/* participants */}
			<div>
				<div className="flex flex-row items-start mb-4">
					<GradientIcon icon={UsersRound} className="size-6 mr-2.5" />
					<div className="flex flex-row justify-between">
						<div>
							<p className="text-xl">{m.event_participants_title()}</p>
							<p className="text-info text-sm">{m.event_participants_text()}</p>
						</div>
						<p className="text-xl ml-6">{event?.summary.users.length}</p>
					</div>
				</div>
				<div className="bg-canvas p-5 rounded-2xl space-y-4">
					{event?.summary.users.map(({ user, available }) => {
						return (
							<div key={user.id} className="flex flex-row">
								<div className="mr-3">
									{user.profilePicture ? (
										<img src={user.profilePicture} alt="PP" className="rounded-full size-8" />
									) : (
										<div className="bg-linear-to-tr from-primary from-5% to-secondary rounded-full size-8">
											{user.name.slice(0, 1)}
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
						);
					})}
				</div>
			</div>
		</main>
	);
}
