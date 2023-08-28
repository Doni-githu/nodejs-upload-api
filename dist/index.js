"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("./routes/user"));
const post_1 = __importDefault(require("./routes/post"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
app.use('/api/user', user_1.default);
app.use('/api/file', post_1.default);
function Run() {
    mongoose_1.default.connect(String(process.env.MONGO_URI))
        .then((res) => console.log('Mongo DB connted'))
        .catch((errr) => console.log(errr));
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log('Server running on port ');
    });
}
Run();
