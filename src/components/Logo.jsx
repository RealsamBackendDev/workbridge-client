import logo from "../assets/logo.png";

export default function Logo({ size = 32, rounded = true }) {
  return (
    <img
      src={logo}
      alt="WorkBridge logo"
      width={size}
      height={size}
      className={rounded ? "rounded-xl" : ""}
    />
  );
}