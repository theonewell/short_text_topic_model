import tensorflow
from tensorflow import keras
from tensorflow.keras.preprocessing.sequence import pad_sequences
import sys, json, pickle
from sklearn.feature_extraction.text import CountVectorizer
def hello_world(request):
    request_args = request.args
    if request_args and "sentence" in request_args:
        seed_text = request_args["sentence"]
    else:
        return 'Error in Python'
    with open('tokenizer.pickle', 'rb') as handle:
        tokenizer = pickle.load(handle)
    model = keras.models.load_model("LSTM-15.h5")

    max_sequence_len = 8
    next_words = 1

    # Same proccess as local version but without keybert
    for _ in range(next_words):
        token_list = tokenizer.texts_to_sequences([seed_text])[0]
        print(token_list)
        token_list = pad_sequences([token_list], maxlen=max_sequence_len-1, padding='pre')
        print(token_list)
        predicted = model.predict_classes(token_list, verbose=0)
        output_word = ""
        wordDict = tokenizer.word_index
        # also uses predicted as an index to select the label from the tokenizer word index
        output_word = list(wordDict.keys())[list(wordDict.values()).index(predicted)]
    return json.dumps(output_word)
