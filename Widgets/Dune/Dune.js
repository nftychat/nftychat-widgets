import { useContext } from "react";
import { Context } from "../../../contexts/MainContext";
import { ReactComponent as LogoDune } from "../../../icons/logo-dune.svg";
import "./Dune.css";

export default function Dune() {
  const { duneIntegrationData } = useContext(Context);
  return (
    <div className="dune_widget">
      <div className="dune_widget__heading">{duneIntegrationData.title}</div>
      <div className="dune_widget__container">
        {/* Sources */}
        {duneIntegrationData.sources?.map((source, index) => {
          return (
            <div className="dune_widget__source_container">
              <iframe
                className="dune_widget__source"
                key={index}
                src={source}
                title={index}
              />
              <LogoDune />
            </div>
          );
        })}
      </div>
    </div>
  );
}
