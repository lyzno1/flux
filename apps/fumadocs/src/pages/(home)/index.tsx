import { Link } from "waku";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="mb-4 font-medium text-xl">Fumadocs on Waku.</h1>
      <Link
        to="/docs"
        className="mx-auto rounded-lg bg-fd-primary px-3 py-2 font-medium text-fd-primary-foreground text-sm"
      >
        Open Docs
      </Link>
    </div>
  );
}

export const getConfig = () => {
  return {
    render: "static",
  };
};
