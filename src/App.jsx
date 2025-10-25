import React from "react";
import { useLocalState } from "./hooks/useLocalState.js";
import { useHashRoute } from "./hooks/useHashRoute.js";
import { TopBar } from "./components/TopBar.jsx";
import { SignInPage, ProfilePage, SignOutPage } from "./pages/AuthPages.jsx";
import { CheckApp } from "./pages/CheckApp.jsx";

export default function App() {
  const { route, navigate } = useHashRoute("app");
  const [auth, setAuth] = useLocalState("auth_v1", null);
  const [history, setHistory] = useLocalState("check_history_v1", []);

  function signIn({ email/*, password*/ }) {
    if (!email) { alert("Vui lòng nhập email"); return; }
    const name = email.split("@")[0];
    setAuth({ email, name, signedAt: Date.now() });
    navigate("app");
  }
  function signOut() { setAuth(null); navigate("signout"); }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar
        auth={auth}
        onSignIn={() => navigate("signin")}
        onProfile={() => navigate("profile")}
        onSignOut={signOut}
      />

      {route !== "app" ? (
        <div className="max-w-7xl mx-auto px-4 py-10">
          {route === "signin" && <SignInPage onSubmit={signIn} />}
          {route === "profile" && (auth ? (
            <ProfilePage user={auth} onUpdate={(u) => { setAuth({ ...auth, ...u }); alert("Đã lưu hồ sơ"); navigate("app"); }} />
          ) : (
            <SignInPage onSubmit={signIn} />
          ))}
          {route === "signout" && <SignOutPage onGoSignIn={() => navigate("signin")} />}
        </div>
      ) : (
        <CheckApp history={history} setHistory={setHistory} />
      )}
    </div>
  );
}
