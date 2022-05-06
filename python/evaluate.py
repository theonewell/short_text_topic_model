from keybert import KeyBERT
from tensorflow import keras
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.feature_extraction.text import CountVectorizer
import warnings
import sys, json
import pickle
warnings.filterwarnings("ignore")

kw_model = KeyBERT()

with open('/Users/theo/Desktop/FP_P/python/tokenizer.pickle', 'rb') as handle:
    tokenizer = pickle.load(handle)

model = keras.models.load_model("/Users/theo/Desktop/FP_P/python/LSTM-15.h5")

# processSen returns a string of extracted keywords from KeyBERT
def processSen(doc):
    keywords = kw_model.extract_keywords(doc, stop_words='english');
    keywordsSen = ''
    keywords.reverse()
    for index, tuple in enumerate(keywords):
        keywordsSen += tuple[0]
        keywordsSen += ' '
    return keywordsSen

input_text = sys.argv[1]
seed_text = processSen(input_text)

max_sequence_len = 8
next_words = 1

for _ in range(next_words):
    # preproccess input sentence
    token_list = tokenizer.texts_to_sequences([seed_text])[0]
    # sequence padding
    token_list = pad_sequences([token_list], maxlen=max_sequence_len-1, padding='pre')
    # predict index of topic label
    predicted = model.predict_classes(token_list, verbose=0)
    output_word = ""
    # select the topic label from tokenizer using predicted (label index)
    for word, index in tokenizer.word_index.items():
        if index == predicted:
            output_word = word
            break

# generate and return json data
output =  { "outputText":output_word}

print (json.dumps(output))



