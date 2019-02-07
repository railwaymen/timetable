import React from 'react';

export const preserveLines = string => `${string}`.split("\n").map((line, idx) => <p key={idx}>{line}</p>)
