import { EllipsisIcon, LinkIcon, PencilIcon, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { useDeleteEvent } from "../../../../hooks/mutation/useDeleteEvent";
import { useGetMe } from "../../../../hooks/query/useGetMe";
import { useGetMyEvents } from "../../../../hooks/query/useGetMyEvents";
import { cn } from "../../../../lib/utils";
import { m } from "../../../../paraglide/messages";
import { Button } from "../../button";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";

export const MyEvents = () => {
	const { data: myEvents, isLoading } = useGetMyEvents();
	const { data: me } = useGetMe();
	const { mutate: deleteEvent } = useDeleteEvent();

	return (
		<>
			{myEvents?.length && !isLoading ? (
				<div className="flex flex-col space-y-4 bg-canvas rounded-xl px-6 py-6 mt-12 mx-4">
					{myEvents.map(event => {
						const isCreator = me?.id === event.creator.id;

						return (
							<div key={event.id} className="bg-paint p-3 rounded-xl">
								<div className="flex flex-row justify-between items-center">
									<div className="flex flex-col">
										<p className="text-xl">{event.name}</p>
										<p className="text-info text-sm">
											{event.respondedCount === 0
												? m.home_event_waiting()
												: m.home_event_responded({ count: event.respondedCount })}
										</p>
									</div>

									<div
										className={cn(
											"rounded-3xl px-3 py-1 mt-1 text-xs font-semibold uppercase tracking-wide",
											isCreator ? "bg-secondary" : "bg-primary",
										)}
									>
										<span>{isCreator ? m.home_event_creator() : m.home_event_joined()}</span>
									</div>

									<div className="flex flex-col items-center">
										<Popover>
											<PopoverTrigger>
												<EllipsisIcon className="size-6 text-white mb-4 cursor-pointer" />
											</PopoverTrigger>
											<PopoverContent className="w-36 p-2 flex flex-col gap-1">
												<button
													type="button"
													className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-paint w-full text-sm cursor-pointer"
													onClick={() => toast(m.home_event_coming_soon())}
												>
													<PencilIcon className="size-4" />
													{m.home_event_update()}
												</button>
												<button
													type="button"
													className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-paint w-full text-sm text-red-400 cursor-pointer"
													onClick={() => deleteEvent(event.shortId)}
												>
													<Trash2Icon className="size-4" />
													{m.home_event_delete()}
												</button>
											</PopoverContent>
										</Popover>
										<Button
											size="xs"
											className="px-2 py-1"
											onClick={() => toast.success("Link copied!")}
										>
											<LinkIcon className="size-4" />
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<>
					<p className="text-4xl font-bold text-center mt-16 mb-10">
						{m.home_hero_title()} <br />
						<span className="text-gradient">{m.home_hero_title_gradient()}</span>
					</p>
					<p className="text-info max-w-xs text-center m-auto">{m.home_hero_text()}</p>
				</>
			)}
		</>
	);
};
