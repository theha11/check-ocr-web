import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "../components/ui/Card.jsx";
import { Label, Input } from "../components/ui/Inputs.jsx";
import { Button } from "../components/ui/Buttons.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";

export function SignInPage({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader title="Sign in" />
        <CardBody className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button onClick={() => onSubmit({ email, password })} className="w-full">Sign in</Button>
        </CardBody>
      </Card>
    </div>
  );
}

export function ProfilePage({ user, onUpdate }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  useEffect(() => { setName(user?.name || ""); setEmail(user?.email || ""); }, [user]);
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader title="Profile" right={<Avatar name={name} />} />
        <CardBody className="space-y-4">
          <div>
            <Label>Display name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <Label>Email</Label>
            <Input disabled value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button className="w-full" onClick={() => onUpdate({ name, email })}>Save</Button>
        </CardBody>
      </Card>
    </div>
  );
}

export function SignOutPage({ onGoSignIn }) {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader title="Signed out" />
        <CardBody className="space-y-4">
          <div className="text-slate-700">Bạn đã đăng xuất.</div>
          <Button className="w-full" onClick={onGoSignIn}>Sign in again</Button>
        </CardBody>
      </Card>
    </div>
  );
}
