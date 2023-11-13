import { twMerge } from "tailwind-merge";

export default function Nav({ className }: { className?: string }) {
  return (
    <nav className={twMerge(className)}>
      <ul className="w-max">
        <li>
          <a className="group flex flex-row items-center py-2" id="about">
            <span
              id="about-indicator"
              className="inline-block h-px w-9 bg-slate-600 mr-4 transition-all group-active:bg-slate-100  group-active:w-14 group-hover:bg-slate-400 group-hover:w-14"
            ></span>
            <span
              id="about-text"
              className="text-slate-500 font-black transition-all text-md group-hover:text-slate-300 group-active:text-slate-100"
            >
              ABOUT
            </span>
          </a>
        </li>
        <li>
          <a className="group flex flex-row items-center py-2">
            <span
              id="projects-indicator"
              className="inline-block h-px w-9 bg-slate-600 mr-4 transition-all group-active:bg-slate-100  group-active:w-14 group-hover:bg-slate-400 group-hover:w-14"
            ></span>
            <span
              id="projects-text"
              className="text-slate-500 font-black transition-all text-md group-hover:text-slate-300 group-active:text-slate-100"
            >
              PROJECTS
            </span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
