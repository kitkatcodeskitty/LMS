import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const aboutUsData = [
  {
    id: 1,
    text: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  },
  {
    id: 2,
    text: "Lorem Ipsum has been the industry's standard dummy text ever since the 1700s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  },
];

const Button = ({ className, onClick, label }) => (
  <button
    className={`bg-rose-500 rounded-[10px] text-[17px] text-white uppercase font-hindVadodara ${className}`}
    onClick={onClick}
  >
    {label}
  </button>
);

function DreamAgency() {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      <div
        className="flex justify-between items-center w-full px-5 sm:px-[50px] flex-col-reverse md:flex-row mt-11 sm:mt-0 gap-16 md:gap-4"
        style={{ minHeight: "462px" }}
      >
        {/* Image container - hidden on mobile */}
        <div className="relative hidden sm:block flex-1 h-full">
          <img
            src="/blue.png"
            alt="about us"
            className="object-fill"
          />
        </div>

        {/* Text container */}
        <div className="flex flex-col justify-center items-center md:items-start flex-1 h-full">
          <div className="flex flex-col relative lg:text-5xl text-4xl text-blue-900 leading-[106.3%] -tracking-[0.01] font-hindVadodara">
            <h1 className="font-bold text-center md:text-left">About Us</h1>
            <span className="lg:text-5xl text-4xl font-light">
              Fake or
              <span className="ml-3 relative z-10">
                Real
                <span className="bg-[#FDC221] h-2 bottom-[10px] lg:bottom-[14px] -z-[1] left-0 absolute w-full" />
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-2 mt-6">
            {aboutUsData.map(({ id, text }) => (
              <span
                key={id}
                className="text-[15px] max-w-full text-center md:text-left Light font-light font-hindVadodara leading-[145.3%] tracking-[0.02]"
              >
                {text}
              </span>
            ))}
          </div>
          <div className="mt-6">
            <Button
              className="whitespace-nowrap max-w-[207px] py-[22px] w-full flex justify-center items-center font-bold leading-[137.3%] tracking-wide px-10"
              label="Explore More"
              onClick={() => navigate("/about-us")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DreamAgency;
