import React, { useContext } from "react";
import { LoginContext } from "../context/LoginContext";
export const CardProfile = ({ data, size }) => {
  const {
    users,
    getUsers,
    userInfo,
    walletId,
    removeFavorite,
    addFavorite,
    favoritedList,
  } = useContext(LoginContext);
  console.log(size);
  if (!data.image) return <></>;
  return (
    <>
      <div
        className="max-w-sm rounded overflow-hidden shadow-lg border-purple-700 	rounded mb-6 flex-shrink-0 mt-6"
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
        }}
      >
        <div
          style={{
            marginRight: "10px",
            display: "flex",
            justifyContent: "flex-end",
            position: "relative",
          }}
        >
          {favoritedList && favoritedList.includes(data.tokenId) ? (
            <img
              style={{
                position: "absolute",
                marginTop: "10px",
                width: "30px",
                height: "30px",
                cursor: "pointer",
              }}
              onClick={() => {
                removeFavorite(data, "cardProfile");
              }}
              src={"/heart.png"}
            />
          ) : (
            <img
              style={{
                position: "absolute",
                marginTop: "10px",
                width: "30px",
                height: "30px",
                cursor: "pointer",
              }}
              onClick={() => {
                addFavorite(data, "cardProfile");
              }}
              src={"/heart2.png"}
            />
          )}
        </div>

        <img
          className="w-full"
          src={data.image}
          style={{
            height: "15.625rem",
            width: size === "userFavorite" ? "15.625rem" : "",
          }}
          alt="Sunset in the mountains"
        />
        <div className="px-6 py-4">
          <div className=" text-white font-bold text-xl mb-2"> {data.name}</div>
          <p className="text-white text-base overflow-ellipsis overflow-hidden">
            {data.description}
          </p>
        </div>

        <div className="px-6 py-4">
          <div className=" text-white font-bold text-xl mb-2"> Price</div>
          <p className="font-bold text-base" style={{ color: "#984dc4" }}>
            {data.price} MATIC
          </p>
        </div>
      </div>
    </>
  );
};
