import type { Metadata } from "next";
import UploadTest from "../../../UploadTest";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function UploadTestPage() {
  return <UploadTest />;
}
