import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icons.Search className="h-10 w-10" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-foreground">
        পাতাটি খুঁজে পাওয়া যায়নি
      </h2>
      <p className="max-w-md text-muted-foreground">
        আপনি যে পাতাটি খুঁজছেন তার অস্তিত্ব নেই বা সরানো হয়েছে।
      </p>
      <Button asChild>
        <Link href="/">হোম পেজে যান</Link>
      </Button>
    </div>
  );
}
