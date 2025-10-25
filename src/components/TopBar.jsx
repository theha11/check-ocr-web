import { useState } from "react";
import { Kebab } from "./ui/Kebab.jsx";

export function TopBar({ auth, onSignIn, onProfile, onSignOut }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="h-14 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">Scan</div>
          <div className="font-semibold">Check Extractor</div>
        </div>
        <div className="relative">
          <Kebab onClick={() => setOpen((s) => !s)} />
          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-md overflow-hidden">
              {!auth && (
                <button className="w-full text-left px-4 py-2 hover:bg-slate-50" onClick={() => { setOpen(false); onSignIn(); }}>
                  Sign in
                </button>
              )}
              {auth && (
                <>
                  <div className="px-4 py-2 text-xs text-slate-500">
                    Signed in as <span className="font-medium">{auth.email}</span>
                  </div>
                  <button className="w-full text-left px-4 py-2 hover:bg-slate-50" onClick={() => { setOpen(false); onProfile(); }}>
                    Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-slate-50" onClick={() => { setOpen(false); onSignOut(); }}>
                    Sign out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
