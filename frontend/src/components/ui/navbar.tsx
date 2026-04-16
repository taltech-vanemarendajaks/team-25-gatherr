import { UserButton } from "./UserButton";

export const Navbar = () => {
	return (
		<nav className="text-white max-w-lg m-auto">
			<div className="flex flex-row items-center justify-between mt-8 mx-6.5">
				<img src="/fireplace.svg" alt="Fireplace" className="h-14 sm:h-16" />
				<span className="font-viking text-4xl sm:text-5xl">Gatherr</span>
				<UserButton />
			</div>
		</nav>
	);
};
