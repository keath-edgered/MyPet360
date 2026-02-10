import { useState } from "react";
import { motion } from "framer-motion";
import { PawPrint, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { auth, googleProvider } from "@/firebase/firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
} from "firebase/auth";
import { toast } from "sonner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorToastStyle = {
      background: "#E53E3E",
      color: "#fff",
      fontWeight: "bold",
    };

    if (isSignUp) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = name.trim() || email.split('@')[0];
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName });
        }
        const username = displayName;
        toast.success(
          <span style={{ color: '#5CA28F', fontWeight: 'bold' }}>
            Welcome, {username}! Your account has been created.
          </span>
        );
        navigate("/dashboard");
      } catch (error: any) {
        console.error("Sign Up Error:", error);
        let errorMessage = "Failed to create an account.";
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already in use. Please sign in.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password must be at least 6 characters long.';
        }
        toast.error(errorMessage, { style: errorToastStyle });
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const username = user.displayName || user.email;
        toast.success(
          <span style={{ color: '#5CA28F', fontWeight: 'bold' }}>
            Welcome back, {username}!
          </span>
        );
        navigate("/dashboard");
      } catch (error: any) {
        console.error("Sign In Error:", error);
        const errorMessage = (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password')
          ? 'Invalid email or password.'
          : 'Failed to sign in. Please try again.';
        toast.error(errorMessage, { style: errorToastStyle });
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const username = user.displayName || user.email;

      toast.success(
        <span style={{ color: '#5CA28F', fontWeight: 'bold' }}>
            Welcome, {username}!
        </span>
        );

      // On successful login, redirect to the dashboard page.
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast.error(error.message || "Failed to sign in with Google.", {
        style: {
          background: "#E53E3E",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    }
  };

  return (
    <>
      <Header />
      <div className="flex min-h-screen flex-col bg-background pt-16 md:flex-row">
      {/* Left - Branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hero-gradient flex flex-col items-center justify-center px-8 py-12 md:w-1/2 md:py-0"
      >
        <Link to="/" className="mb-8 flex items-center gap-3">
          <PawPrint className="h-10 w-10 text-primary" />
          <span className="text-3xl font-bold text-foreground">
            MyPet<span className="text-primary">360</span>
          </span>
        </Link>
        <h2 className="mb-4 max-w-sm text-center text-2xl font-bold leading-snug text-foreground md:text-3xl">
          Your Pet's World,{" "}
          <span className="text-primary">All in One Place</span>
        </h2>
        <p className="max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
          Find vet clinics, pet food stores, and flag lost pets on a live map — all from one app.
        </p>
      </motion.div>
      {/* Right - Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full max-w-md"
        >
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {isSignUp
              ? "Join thousands of pet parents on MyPet360"
              : "Sign in to continue to MyPet360"}
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <PawPrint className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {!isSignUp && (
              <div className="flex justify-end">
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}
            <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">or</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full rounded-full"
            type="button"
            onClick={handleGoogleSignIn}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold text-primary hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default Login;