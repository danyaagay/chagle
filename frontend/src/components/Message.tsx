import {
	Stack,
} from '@mantine/core';

import classes from '../css/Message.module.css';

interface MessageProps {
	text: string;
	marker?: string;
	time: string;
	you?: boolean;
}

export default function Message({ you, marker, time, text, ...others }: MessageProps) {
	return (
		<>
			{(marker ? <div className={classes.timeBox}><span className={classes.timeMarker}>{marker}</span></div> : null)}
			<Stack className={classes.bubble} {...others}>
				<div className={`${classes.bubbleWrapper} ${(you ? classes.you : '')}`}>
					<div className={`${classes.bubbleContent} ${(you ? classes.bubbleContentYou : '')}`}>
						{text}
						<span className={classes.time}>{time}</span>
					</div>
				</div>
			</Stack>
		</>
	);
}