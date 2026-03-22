import { Redirect } from "expo-router";

export default function Register() {
  return <Redirect href="/(auth)/login?tab=register" />;
}
