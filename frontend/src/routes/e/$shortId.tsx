import { createFileRoute } from "@tanstack/react-router";
import { Link, PenBoxIcon, UsersRound } from "lucide-react";
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
						<Link className="size-5" />
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
					<p className="text-2xl mb-8">Sign in to add your availability</p>
					<div className="mb-8">
						<Button onClick={() => {}} className="px-8">
							<GoogleIcon className="size-8 mr-3" />
							{m.create_continue_with_google()}
						</Button>
					</div>
					<p className="text-info text-center">This also allows you to get</p>
					<p className="text-info text-center -mt-1">your google calendar events</p>
				</div>
			)}

			{/* heatmap */}
			<div className="mb-6">
				<div className="flex flex-row items-start">
					<GradientIcon icon={PenBoxIcon} className="size-6 mr-2.5" />
					<div>
						<p className="text-lg">Mark your availability</p>
						<p className="text-info text-sm">
							Click and drag on the grid below to mark your availability
						</p>
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
							<p className="text-xl">Participants</p>
							<p className="text-info text-sm">
								Select participants to highlight their specific times{" "}
							</p>
						</div>
						<p className="text-xl ml-6">{event?.summary.users.length}</p>
					</div>
				</div>
				<div className="bg-canvas p-5 rounded-2xl space-y-4">
					{event?.summary.users.map(({ user, available }) => {
						return (
							<div key={user.id} className="flex flex-row">
								<div className="size-8 mr-3">
									{user.profilePicture ? (
										<img src={user.profilePicture} alt="PP" className="rounded-full" />
									) : (
										<div className="bg-linear-to-tr from-primary from-5% to-secondary rounded-full">
											{user.name.slice(0, 1)}
										</div>
									)}
								</div>
								<div>
									<p className="text-xl">{user.name}</p>
									<p className="text-sm text-info">{available.length} time slots</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</main>
	);
}
