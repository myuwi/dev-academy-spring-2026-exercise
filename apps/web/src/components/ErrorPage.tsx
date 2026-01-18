import type { HTTPError } from "ky";

interface ErrorPageProps {
  error: HTTPError;
}

export const ErrorPage = ({ error }: ErrorPageProps) => {
  return (
    <div className="page">
      <div className="py-16 text-center">
        <h1>{error.response.status}</h1>
        <p className="text-subtle">{error.response.statusText}</p>
      </div>
    </div>
  );
};
