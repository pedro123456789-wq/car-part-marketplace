import React from "react";
import NavigationBar from "./components/NavigationBar";
import Listings from "./listings/page";

export default function Home() {
  return (
    <Listings isListSelf={false} />
  );
}
