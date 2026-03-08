import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { fetchPersonDetail, clearDetail } from "@/store/slices/movieSlice";
import PersonInfo from "../components/PersonInfo";
import PersonKnownFor from "../components/PersonKnownFor";
import Loader from "@/components/common/Loader";

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { personDetail: person, isDetailLoading } = useAppSelector(
    (state) => state.movies,
  );

  useEffect(() => {
    if (id) dispatch(fetchPersonDetail(Number(id)));
    return () => {
      dispatch(clearDetail());
    };
  }, [dispatch, id]);

  if (isDetailLoading || !person) return <Loader />;

  const knownFor = person.combined_credits?.cast?.slice(0, 12) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeInUp">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 p-2.5 rounded-full flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <HiArrowLeft size={18} />
        <span className="text-sm">Back</span>
      </button>

      <PersonInfo person={person} />
      <PersonKnownFor knownFor={knownFor} />
    </div>
  );
}
