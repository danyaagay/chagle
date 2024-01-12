import {
	Stack,
} from '@mantine/core';
import Markdown from 'react-markdown'
import classes from '../css/Message.module.css';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageProps {
	text: string;
	marker?: string;
	you?: boolean;
	is_error?: boolean;
}

export default function Message({ you, marker, text, is_error, ...others }: MessageProps) {
	you = !!you;
	is_error = !!is_error;
	return (
		<>
			{(marker ? <div className={classes.timeBox}><span className={classes.timeMarker}>{marker}</span></div> : null)}
			<Stack className={classes.message} {...others}>
				<div className={`${classes.messageWrapper} ${(you ? classes.you : '')}`}>
					<div className={`${classes.messageContent} ${(you ? classes.messageContentYou : '')}`}>
						<div className={classes.markdownBody}>
							{you && text}

							{!you && !is_error && (
								<Markdown
									children={text}
									components={{
										code(props) {
											const { children, className, node, ...rest } = props
											const match = /language-(\w+)/.exec(className || '')
											return match ? (
												// @ts-ignore
												<SyntaxHighlighter
													{...rest}
													PreTag="div"
													children={String(children).replace(/\n$/, '')}
													language={match[1]}
													style={oneLight}
													wrapLongLines
												/>
											) : (
												<code {...rest} className={className}>
													{children}
												</code>
											)
										}
									}}
								/>
							)}

							{!you && is_error && (
								<p style={{ color: 'red' }}>
									{text}
								</p>
							)}
						</div>
					</div>
				</div>
			</Stack>
		</>
	);
}