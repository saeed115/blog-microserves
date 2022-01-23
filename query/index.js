import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import cors from 'cors';

const app = express();

app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handelEvent = (type, data) => {
	if (type === 'PostCreated') {
		const { id, title } = data;

		posts[id] = {
			id,
			title,
			comments: [],
		};
	}

	if (type === 'CommentCreated') {
		const { id, content, postId, status } = data;
		const post = posts[postId];

		post.comments.push({ id, content, status });
	}

	if (type === 'CommentUpdated') {
		const { id, content, postId, status } = data;

		const post = posts[postId];
		const comment = post.comments.find((c) => c.id == id); // c == comment

		comment.status = status;
		comment.content = content;
	}
};

app.get('/posts', (req, res) => {
	res.send(posts);
});

app.post('/events', (req, res) => {
	const { type, data } = req.body;

	handelEvent(type, data);

	res.send({});
});

app.listen(4002, async () => {
	console.log('Listening on port 4002');

	const res = await axios.get('http://event-bus-srv:4005/events');
	for (const event of res.data) {
		console.log('Processing Data:', event.type);

		handelEvent(event.type, event.data);
	}
});
