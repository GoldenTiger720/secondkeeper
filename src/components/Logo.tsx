import { Link } from "react-router-dom";

export function Logo({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Link to="/" className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center">
        <img src="icon.png" alt="SecondKeeper Logo Icon" className="h-8 w-8" />
        <img
          src="/Logo.png"
          alt="SecondKeeper Logo Text"
          className="h-12 ml-2 hidden sm:block"
        />
      </div>
    </Link>
  );
}
