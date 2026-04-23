import { UserRound, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useGoogleAuth } from "../../hooks/mutation/useGoogleAuth";
import { useLogout } from "../../hooks/mutation/useLogout";
import { useUpdateUser } from "../../hooks/mutation/useUpdateUser";
import { useGetMe } from "../../hooks/query/useGetMe";
import { m } from "../../paraglide/messages";
import { getLocale, setLocale } from "../../paraglide/runtime";
import { GoogleIcon } from "../icons/GoogleIcon";
import { GradientIcon } from "../icons/GradientIcon";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";
import { ToggleSlider } from "./ToggleSlider";

export const UserButton = () => {
	const { data: me } = useGetMe();

	const { mutate: updateUser } = useUpdateUser();
	const handleLogin = useGoogleAuth();
	const logout = useLogout();

	const [weekStartsOn, setWeekStartsOn] = useState(
		me?.startOnMonday === true || me?.startOnMonday === undefined ? 0 : 1,
	);

	return (
		<Popover>
			<PopoverTrigger className="disabled:opacity-80">
				{me ? (
					<GradientIcon icon={UserRoundCheck} className="size-12 cursor-pointer" />
				) : (
					<GradientIcon icon={UserRound} className="size-12 cursor-pointer" />
				)}
			</PopoverTrigger>
			<PopoverContent className="mr-3 mt-3 px-6" align="start">
				<p className="text-2xl font-semibold mb-5">{m.user_settings_settings()}</p>
				<div className="flex flex-col mb-4">
					<p className="ml-1 mb-1 font-semibold">{m.user_settings_week_starts_on()}</p>
					<ToggleSlider
						onChange={index => {
							if (me) {
								updateUser({ startOnMonday: index === 0 });
							} else {
								toast.error(m.user_settings_sign_in_to_save());
							}
						}}
						options={[m.user_settings_monday(), m.user_settings_sunday()]}
						selectedIndex={weekStartsOn}
						setSelectedIndex={setWeekStartsOn}
					/>
				</div>
				<div className="flex flex-col mb-4">
					<p className="ml-1 mb-1 font-semibold">{m.user_settings_language()}</p>
					<Select value={getLocale()} onValueChange={(value: "en" | "et") => setLocale(value)}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="et">Eesti</SelectItem>
								<SelectItem value="en">English</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
				{me && (
					<Button variant="dark" onClick={logout} className="mb-3 mt-4 px-4 text-sm w-full">
						Sign out
					</Button>
				)}
				{!me && (
					<Button onClick={handleLogin} className="mb-8 px-4 text-sm">
						<GoogleIcon className="size-5.5 mr-2" />
						{m.create_continue_with_google()}
					</Button>
				)}
			</PopoverContent>
		</Popover>
	);
};
