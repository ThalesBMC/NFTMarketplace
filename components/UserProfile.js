import React from "react";
import { CardProfile } from "./CardProfile";
import "react-perfect-scrollbar/dist/css/styles.css";
import PerfectScrollbar from "react-perfect-scrollbar";
export const UserProfile = ({ data }) => {
  if (!data.imgUrl) return <></>;
  return (
    <>
      <div
        className="ml-2 space-x-10 rounded overflow-hidden shadow-lg border-purple-700 	rounded mb-6 flex justify- items-start flex-col sm:flex-row"
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
        }}
      >
        <div className="flex justify-center items-center flex-col ">
          <img
            className="rounded-full mt-4 border-4"
            src={data.imgUrl}
            style={{
              borderColor: "#b84ef2",
              minWidth: "300px",
              height: "300px",
              marginLeft: "20px",
            }}
          />

          <div className="px-6 py-4">
            <div className=" text-white font-bold text-xl mb-2">
              {" "}
              {data.name}
            </div>
            <p className="text-white text-base ">{data.description}</p>
          </div>
        </div>
        <div style={{overflow: "auto"}}>
          <div className=" w-full flex  items-center flex-row space-x-6 ">
            {data.favorites
              ? data.favorites.map((e) => (
                  <CardProfile key={e.image} data={e} size={"userFavorite"} />
                ))
              : null}
          </div>
        </div>
      </div>
    </>
  );
};
