import React from "react";

const Image = (props: any) => {
  const { fill, priority, ...rest } = props;
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...rest} />;
};

export default Image;
