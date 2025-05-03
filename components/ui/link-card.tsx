import { useListenInView } from "@/lib/in-view";

export type Link = { id: string; text: string };
export default function LinkCard(props: Link) {
  const inView = useListenInView(`#${props.id}`);
  return (
    <li key={props.id}>
      <a
        href={`#${props.id}`}
        className="group flex flex-row items-center py-2"
        data-active={inView}
      >
        <span
          className={
            "inline-block h-px w-9 bg-slate-600 mr-4 transition-all group-data-[active=true]:bg-slate-100 group-data-[active=true]:w-14 group-hover:bg-slate-400 group-hover:w-14"
          }
        />
        <span
          className={
            "text-slate-500 font-black transition-all text-md group-hover:text-slate-300 group-active:text-slate-100 uppercase"
          }
        >
          {props.text}
        </span>
      </a>
    </li>
  );
}
