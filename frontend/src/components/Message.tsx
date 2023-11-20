import {
	Stack,
} from '@mantine/core';
import Markdown from 'react-markdown'
import classes from '../css/Message.module.css';

interface MessageProps {
	text: string;
	marker?: string;
	time: string;
	you?: boolean;
	is_error?: boolean;
}

export default function Message({ you, marker, time, text, is_error, ...others }: MessageProps) {
	return (
		<>
			{(marker ? <div className={classes.timeBox}><span className={classes.timeMarker}>{marker}</span></div> : null)}
			<Stack className={classes.message} {...others}>
				<div className={`${classes.messageWrapper} ${(you ? classes.you : '')}`}>
					<div className={`${classes.messageContent} ${(you ? classes.messageContentYou : '')}`}>
						<div className={classes.markdownBody}>
							{you && text}

							{!you && !is_error && (
								<Markdown>
									{text}
								</Markdown>
							)}

							{!you && is_error && (
								<p style={{color: 'red'}}>
									{text}
								</p>
							)}
						</div>
						<span className={classes.time}>{time}</span>
					</div>
				</div>
			</Stack>
		</>
	);
}