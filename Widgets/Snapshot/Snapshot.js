/* eslint-disable react-hooks/exhaustive-deps */
import Moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { Context } from "../../../contexts/MainContext";
import { getEnsInfo } from "../../../utilities";
import "./Snapshot.scss";

export default function Snapshot() {
  const [proposals, setProposals] = useState(null);
  const [activeProposals, setActiveProposals] = useState(null);
  const { snapshotSource, snapshotSpaceName } = useContext(Context);

  useEffect(() => {
    if (["", null, false].includes(snapshotSource)) {
      setProposals(null);
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;

    const url = "https://hub.snapshot.org/graphql";
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query Proposals {
            proposals(
              first: 20,
              skip: 0,
              where: {
                space_in: ["${snapshotSource}"],
              },
              orderBy: "created",
              orderDirection: desc
            ) {
              id
              title
              start
              end
              snapshot
              state
              author
              choices
              space {
                id
                name
              }
            }
          }
        `,
      }),
      signal,
    })
      .then((res) => res.json())
      .then((result) => {
        if (result && "proposals" in result.data) {
          let sortedProposals = result.data.proposals;
          sortedProposals.sort((a, b) => (a.state === "active" ? -1 : 0));

          // Get and set all active proposals
          const nonActiveProposals = sortedProposals.filter(
            (proposal) => proposal.state !== "active"
          );
          setProposals(nonActiveProposals);

          // Get and set all active proposals
          const activeFitlered = sortedProposals.filter(
            (proposal) => proposal.state === "active"
          );
          setActiveProposals(activeFitlered);

          // console.log('::::', snapshotSource, sortedProposals);
        }
      });

    // When user deactivate Snapshot widget, cancel the pending fetch if not done
    return () => controller.abort();
  }, [snapshotSource]);

  return (
    <div className="snapshot_widget">
      <div className="snapshot_widget__heading">
        {snapshotSpaceName} Proposals
      </div>
      <div className="snapshot_widget__container">
        {/* Active proposals and doesn't show when null or length is zero */}
        {activeProposals !== null && activeProposals.length > 0 && (
          <div className="snapshot_widget__active_container">
            <p className="snapshot_widget__active_heading">Active</p>
            {activeProposals.map((proposal, index) => {
              return <ActiveProposal key={index} proposal={proposal} />;
            })}
          </div>
        )}

        {/* Recent proposals and doesn't show when null or length is zero */}
        {proposals !== null && proposals.length > 0 && (
          <div className="snapshot_widget__active_container">
            <p className="snapshot_widget__recent_heading">Recent</p>
            {proposals?.slice(0, 3).map((proposal, index) => {
              return (
                <a
                  className="snapshot_widget__proposal"
                  href={`https://snapshot.org/#/${proposal.space.id}/proposal/${proposal.id}`}
                  key={index}
                  rel="noreferrer"
                  target="_blank"
                >
                  <p className="snapshot_widget__title">{proposal.title}</p>
                  <div className="snapshot_widget__info">
                    <p className="snapshot_widget__state">
                      Status: &nbsp;
                      <span
                        style={{
                          backgroundColor:
                            proposal.state === "active"
                              ? "#20b66e"
                              : proposal.state === "pending"
                              ? "rgb(107, 114, 128)"
                              : "#7c3bec",
                        }}
                      >
                        {proposal.state}
                      </span>
                    </p>
                  </div>
                  <div className="snapshot_widget__info">
                    <p className="snapshot_widget__date">
                      End date:{" "}
                      {Moment.unix(proposal.end).format("MMMM DD, YYYY")}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveProposal(props) {
  const [votes, setVotes] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const url = "https://hub.snapshot.org/graphql";

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            votes (
              first: 100
              skip: 0
              where: {
                proposal: "${props.proposal.id}"
              }
              orderBy: "created",
              orderDirection: desc
            ) {
              id
              voter
              vp
              vp_by_strategy
              vp_state
              created
              proposal {
                id
              }
              choice
              space {
                id
              }
            }
          }
        `,
      }),
      signal,
    })
      .then((res) => res.json())
      .then((result) => {
        // console.log(">>>>", result);
        const filteredVotes = result.data.votes
          .filter((vote) => vote.vp >= 10) // Get vp greater than or equal to 10
          .slice(0, 5); // Get the first 5 elements in array
        setVotes(filteredVotes);
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      <a
        className="snapshot_widget__proposal"
        href={`https://snapshot.org/#/${props.proposal.space.id}/proposal/${props.proposal.id}`}
        rel="noreferrer"
        target="_blank"
      >
        <p className="snapshot_widget__title">{props.proposal.title}</p>
        <div className="snapshot_widget__info">
          <p className="snapshot_widget__date snapshot_widget__date___italic">
            {Moment.utc(props.proposal.end * 1000).fromNow()} left to vote
          </p>
        </div>
      </a>

      {votes !== null && votes.length > 0 && (
        <div className="snapshot_widget__table">
          <div className="snapshot_widget__top_row">
            <p>Name</p>
            <p>Vote</p>
            <p>Voting Power</p>
          </div>
          {votes?.map((vote, index) => (
            <Row {...props} key={index} vote={vote} />
          ))}
          <p className="snapshot_widget__table_link">
            <a
              href={`https://snapshot.org/#/${props.proposal.space.id}/proposal/${props.proposal.id}`}
              rel="noreferrer"
              target="_blank"
            >
              View more
            </a>
          </p>
        </div>
      )}
    </>
  );
}

function Row(props) {
  const [ensName, setEnsName] = useState("");
  const [isDisplayed, setIsDisplayed] = useState(true);

  const renderVote = useCallback(() => {
    if (Array.isArray(props.vote.choice)) {
      // console.log(':',
      //   props.proposal.title,
      //   ensName,
      //   props.proposal.choices,
      //   props.proposal.choices[props.vote.choice[0]],
      //   props.vote.choice[0]
      // );
      return `(1st) ${props.proposal.choices[props.vote.choice[0] - 1]}`;
    }
    return `${props.proposal.choices[props.vote.choice - 1]}`;
  }, []);

  const displayVotingPower = useCallback(() => {
    if (props.vote.vp === 0) setIsDisplayed(false);
    const maximumFractionDigits = props.vote.vp < 1 ? 3 : 0;
    return new Intl.NumberFormat("en", {
      compactDisplay: "short",
      maximumFractionDigits: maximumFractionDigits,
      minimumFractionDigits: 0,
      notation: "compact",
    }).format(props.vote.vp);
  }, []);

  useEffect(() => {
    async function asyncFunction() {
      const { displayName } = await getEnsInfo(props.vote.voter);
      // console.log(">>>> 1", props.vote.voter, ensName);
      setEnsName(displayName);
    }

    asyncFunction();
  }, []);

  if (!isDisplayed) return null;
  return (
    <div className="snapshot_widget__row">
      <p>{ensName}</p>
      <p>{renderVote()}</p>
      <p>{displayVotingPower()} ENS</p>
    </div>
  );
}
