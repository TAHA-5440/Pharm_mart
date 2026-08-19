import { logoutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton({ next }: { next?: string }) {
  return (
    <form action={logoutAction}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Button type="submit" variant="outline">
        Log out
      </Button>
    </form>
  );
}
