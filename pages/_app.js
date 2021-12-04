import "../styles/globals.css";

import Link from "next/link";
import { useRouter } from "next/router";
import { LoginContextProvider } from "../context/LoginContext";
function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <LoginContextProvider>
      <div style={{ backgroundColor: "#18142c" }}>
        <nav className="border-b p-6" style={{ borderColor: "#b84ef2" }}>
          <p className="text-4xl font-bold" style={{ color: "#b84ef2" }}>
            UFPE NFT MARKET
          </p>
          <div className="flex mt-4 w-3/4">
            <div className="flex flex-col items-center w-full">
              <Link href="/">
                <a
                  className="mr-4 text-purple-500  text-2xl"
                  style={{ alignText: "center" }}
                >
                  Home
                </a>
              </Link>
              {router.pathname === "/" && (
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "#b84ef2",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                  }}
                />
              )}
            </div>
            <div className="flex flex-col items-center w-full">
              <Link href="/create-item">
                <a className="mr-6 text-purple-500 text-2xl	">
                  Sell Digital Asset
                </a>
              </Link>
              {router.pathname === "/create-item" && (
                <div
                  style={{
                    width: "90%",
                    height: "6px",
                    backgroundColor: "#b84ef2",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    marginRight: "10%",
                  }}
                />
              )}
            </div>
            <div className="flex flex-col items-center w-full">
              <Link href="/my-assets">
                <a className="mr-6 text-purple-500 text-2xl	">
                  My Digital Assets
                </a>
              </Link>
              {router.pathname === "/my-assets" && (
                <div
                  style={{
                    width: "90%",
                    height: "6px",
                    backgroundColor: "#b84ef2",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    marginRight: "10%",
                  }}
                />
              )}
            </div>
            <div className="flex flex-col items-center w-full">
              <Link href="/creator-dashboard">
                <a className="mr-6 text-purple-500 text-2xl	">
                  Creator Dashboard
                </a>
              </Link>
              {router.pathname === "/creator-dashboard" && (
                <div
                  style={{
                    width: "90%",
                    height: "6px",
                    backgroundColor: "#b84ef2",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    marginRight: "10%",
                  }}
                />
              )}
            </div>
            <div className="flex flex-col items-center w-full">
              <Link href="/users">
                <a className="mr-6 text-purple-500 text-2xl	">Users</a>
              </Link>
              {router.pathname === "/users" && (
                <div
                  style={{
                    width: "90%",
                    height: "6px",
                    backgroundColor: "#b84ef2",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    marginRight: "10%",
                  }}
                />
              )}
            </div>
            <div className="flex flex-col items-center w-full">
              <Link href="/perfil">
                <a className="mr-6 text-purple-500 text-2xl	">Perfil</a>
              </Link>
              {router.pathname === "/perfil" && (
                <div
                  style={{
                    width: "90%",
                    height: "6px",
                    backgroundColor: "#b84ef2",
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    marginRight: "10%",
                  }}
                />
              )}
            </div>
          </div>
        </nav>
        <Component {...pageProps} />
      </div>
    </LoginContextProvider>
  );
}

export default MyApp;
