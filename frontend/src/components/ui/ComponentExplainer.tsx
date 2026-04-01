interface Props {
	title: string;
	text: string;
}
export const ComponentExplainer = ({ title, text }: Props) => {
	return (
		<div className="text-left mb-4">
			<h2 className="text-content text-xl">{title}</h2>
			<p className="text-info text-sm">{text}</p>
		</div>
	);
};
