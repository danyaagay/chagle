import {
	createStyles,
	Stack,
} from '@mantine/core';
  
const useStyles = createStyles((theme) => ({
	bubble: {
		display: 'block',
		width: '100%',
	},
	bubbleWrapper: {
		display: 'flex',
	},
	bubbleContent: {
		display: 'flex',
		position: 'relative',
		backgroundColor: '#ffffff',
		border: '0.0625rem solid #dee2e6',
		padding: '6px 45px 6px 10px',
		borderRadius: '12px 12px 12px 6px',
		fontSize: theme.fontSizes.nm,
	},
	time: {
		position: 'absolute',
		bottom: 0,
    	right: 0,
		paddingRight: '5px',
		fontSize: '0.775rem',
		color: 'rgb(0 0 0 / 55%)',
	},
	bubbleContentYou: {
		borderBottomRightRadius: '6px !important',
		borderBottomLeftRadius: '12px !important',
		backgroundColor: '#e6fcf5',
		border: `0.0625rem solid #e6fcf5`,

	},
	you: {
		flexDirection: 'row-reverse',
	},
	timeBox: {
		display: 'flex',
	},
	timeMarker: {
		margin: '5px auto',
		fontSize: theme.fontSizes.md,
		color: 'rgb(134, 142, 150)',
	}
  }));
  
  interface MessageProps {
	text: string;
	marker?: string;
	time: string;
	you?: boolean;
  }
  
  export default function Message({ you, marker, time, text, ...others }: MessageProps) {
	const { classes } = useStyles();

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