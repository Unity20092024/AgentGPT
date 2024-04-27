import clsx from "clsx";
import { useRouter } from "next/router";
import type { Session } from "next-auth";
import { useTranslation } from "next-i18next";
import { BsThreeDots } from "react-icons/bs";
import { FaSignInAlt } from "react-icons/fa";

import Dialog from "../../ui/dialog";
import { get_avatar } from "../../utils/user";

type AuthItemProps = {
  session: Session | null;
  classname?: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthItem: FC<AuthItemProps> = ({ session, classname, signOut, signIn }) => {
  const [t] = useTranslation("drawer");
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const user = session?.user;

  const organization = user?.organizations?.at(0)?.name;

  return (
    <div className="flex items-center justify-between">
      <div
        className={clsx(
          "flex flex-1 cursor-pointer items-center justify-start gap-3 rounded-md px-1.5 py-2 text-sm font-semibold text-slate-12 hover:bg-slate-5",
          classname
        )}
        onClick={(e) => {
          user ? setShowDialog(true) : void signIn();
        }}
      >
        {user && (
          <div
            className="relative"
            role="button"
            aria-label={t("myAccount")}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setShowDialog(true);
              }
            }}
            data-cy="user-avatar"
          >
            <img
              className="h-6 w-6 rounded-full bg-neutral-800"
              src={get_avatar(user)}
              alt={`${user.name}'s avatar`}
            />
          </div>
        )}

        {!user && (
          <h1 className="ml-2 flex h-6 w-6 flex-grow items-center gap-2 text-center text-slate-12">
            <FaSignInAlt aria-hidden="true" />
            <p data-cy="sign-in-button">Sign in</p>
          </h1>
        )}

        <span className="sr-only">Your profile</span>
        <div>
          <p
            aria-hidden="true"
            className="max-w-[6.5rem] overflow-hidden text-ellipsis text-black"
            data-cy="user-name"
          >
            {user?.name}
          </p>
        </div>
        {user && <BsThreeDots className="ml-auto text-black" data-cy="three-dots-icon" />}

        <Dialog
          inline
          open={showDialog}
          setOpen={setShowDialog}
          title={t("myAccount")}
          icon={<img className="h-20 w-20 rounded-md" src={get_avatar(user)} alt="" />}
          role="dialog"
          aria-label={t("myAccount")}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setShowDialog(false);
            }
          }}
          data-testid="my-account-dialog"
          data-cy="my-account-dialog"
        >
          <div className="mt-2 w-full text-center">
            <p className="max-w-full text-sm text-gray-600" data-cy="user-email">
              {user?.email}
            </p>
            <p className="text-sm text-gray-400" data-cy="user-organization">
              {organization}
            </p>
          </div>
          <div className="mt-4 flex gap-4 justify-center">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-400"
              onClick={() => {
                signOut()
                  .then(() => setShowDialog(false))
                  .catch(console.error)
                  .finally(console.log);
              }}
              data-cy="sign-out-button"
            >
              Sign out
            </button>
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-slate-1 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-slate-3"
              onClick={() => setShowDialog(false)}
              data-cy="close-button"
            >
              Close
            </button>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default AuthItem;
