const Hamburger = (props: any) => {
  return (
    <svg viewBox="0 0 40 23" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fillRule="evenodd">
        <g transform="translate(-299 -40)">
          <g transform="translate(299 40)">
            <rect y="4" width="40" height="2"></rect>
            <rect y="14" width="40" height="2"></rect>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default Hamburger;
