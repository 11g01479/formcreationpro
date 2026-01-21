import React, { useState } from 'react';
import { FormStructure, FormItem } from '../types';
import { Clipboard, Download, CheckCircle2, ChevronDown, Calendar, Clock, Code, X, ExternalLink } from 'lucide-react';

interface FormPreviewProps {
  form: FormStructure;
  onCopy: () => void;
  onDownload: () => void;
}

const generateGAS = (form: FormStructure): string => {
  const itemsCode = form.items.map(item => {
    let method = '';
    let extra = '';
    // Generate a single ID per item using substring instead of substr
    const itemId = Math.random().toString(36).substring(2, 7);

    switch (item.type) {
      case 'TEXT':
        method = 'addTextItem()';
        break;
      case 'PARAGRAPH':
        method = 'addParagraphTextItem()';
        break;
      case 'RADIO':
        method = `addMultipleChoiceItem()`;
        if (item.options) {
          const optionsStr = item.options.map(o => `"${o.replace(/"/g, '\\"')}"`).join(', ');
          extra = `.setChoiceValues([${optionsStr}])`;
        }
        break;
      case 'CHECKBOX':
        method = `addCheckboxItem()`;
        if (item.options) {
          const optionsStr = item.options.map(o => `"${o.replace(/"/g, '\\"')}"`).join(', ');
          extra = `.setChoiceValues([${optionsStr}])`;
        }
        break;
      case 'DROPDOWN':
        method = `addListItem()`;
        if (item.options) {
          const optionsStr = item.options.map(o => `"${o.replace(/"/g, '\\"')}"`).join(', ');
          extra = `.setChoiceValues([${optionsStr}])`;
        }
        break;
      case 'SCALE':
        if (item.scaleDetails) {
          method = `addScaleItem()`;
          extra = `.setBounds(${item.scaleDetails.min}, ${item.scaleDetails.max}).setLabels("${item.scaleDetails.minLabel}", "${item.scaleDetails.maxLabel}")`;
        }
        break;
      case 'DATE':
        method = 'addDateItem()';
        break;
      case 'TIME':
        method = 'addTimeItem()';
        break;
    }

    return `  // ${item.title}
  var item${itemId} = form.${method};
  item${itemId}.setTitle("${item.title.replace(/"/g, '\\"')}")
      .setHelpText("${(item.helpText || '').replace(/"/g, '\\"')}")
      .setRequired(${item.isRequired})${extra};
`;
  }).join('\n');

  return `/**
 * SurveyArchitect Pro - Google Form Auto-Generator
 * 
 * 使い方:
 * 1. https://script.google.com/ にアクセス
 * 2. 「新しいプロジェクト」を作成
 * 3. このコードをエディタに貼り付けて「保存」して「実行」
 * 4. 承認を求められたら許可してください
 * 5. 実行後、エディタ下部の「実行ログ」にフォームのURLが表示されます
 */

function createGoogleForm() {
  var form = FormApp.create("${form.formTitle.replace(/"/g, '\\"')}");
  form.setDescription("${form.formDescription.replace(/"/g, '\\"').replace(/\n/g, '\\n')}");
  
${itemsCode}

  var editUrl = form.getEditUrl();
  var publishedUrl = form.getPublishedUrl();

  console.log('--- フォーム作成完了 ---');
  console.log('編集用URL: ' + editUrl);
  console.log('回答用URL: ' + publishedUrl);
  console.log('------------------------');
  
  // ログに出力されたURLをクリックして確認してください
}`;
};

const ItemPreview: React.FC<{ item: FormItem }> = ({ item }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          {item.title}
          {item.isRequired && <span className="text-red-500 ml-1 text-sm font-normal">*必須</span>}
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
          {item.type}
        </span>
      </div>
      
      {item.helpText && (
        <p className="text-sm text-gray-500 mb-4">{item.helpText}</p>
      )}

      <div className="mt-4">
        {item.type === 'TEXT' && (
          <div className="border-b border-gray-300 w-full md:w-1/2 py-2 text-gray-400 text-sm">記述（短文）</div>
        )}
        
        {item.type === 'PARAGRAPH' && (
          <div className="border-b border-gray-300 w-full py-4 text-gray-400 text-sm">記述（長文）</div>
        )}

        {(item.type === 'RADIO' || item.type === 'CHECKBOX') && item.options && (
          <div className="space-y-3">
            {item.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-4 h-4 border border-gray-300 ${item.type === 'RADIO' ? 'rounded-full' : 'rounded'}`}></div>
                <span className="text-gray-700">{opt}</span>
              </div>
            ))}
          </div>
        )}

        {item.type === 'DROPDOWN' && item.options && (
          <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-2 text-gray-700 w-full md:w-2/3">
            <span>選択してください</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        )}

        {item.type === 'SCALE' && item.scaleDetails && (
          <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-4 mt-2">
            <span className="text-sm text-gray-600">{item.scaleDetails.minLabel} ({item.scaleDetails.min})</span>
            <div className="flex gap-2">
              {Array.from({ length: item.scaleDetails.max - item.scaleDetails.min + 1 }, (_, i) => i + item.scaleDetails.min).map(n => (
                <div key={n} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                  {n}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-600">{item.scaleDetails.maxLabel} ({item.scaleDetails.max})</span>
          </div>
        )}

        {item.type === 'DATE' && (
          <div className="flex items-center gap-3 border border-gray-300 rounded px-3 py-2 text-gray-400 w-48">
            <Calendar size={16} />
            <span>年/月/日</span>
          </div>
        )}

        {item.type === 'TIME' && (
          <div className="flex items-center gap-3 border border-gray-300 rounded px-3 py-2 text-gray-400 w-48">
            <Clock size={16} />
            <span>時刻</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const FormPreview: React.FC<FormPreviewProps> = ({ form, onCopy, onDownload }) => {
  const [showGasModal, setShowGasModal] = useState(false);
  const gasCode = generateGAS(form);

  const copyGasToClipboard = () => {
    navigator.clipboard.writeText(gasCode);
    alert('Apps Scriptをコピーしました！');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200 relative">
      <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <CheckCircle2 className="text-indigo-600" size={20} />
          生成されたフォーム構成
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGasModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Code size={16} />
            自動作成スクリプト
          </button>
          <button
            onClick={onCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clipboard size={16} />
            JSONコピー
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Download size={16} />
            保存
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-4xl mx-auto w-full">
        <div className="bg-white border-t-8 border-indigo-600 rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{form.formTitle}</h1>
          <div className="text-gray-600 whitespace-pre-wrap leading-relaxed border-t border-gray-100 pt-4">
            {form.formDescription}
          </div>
        </div>

        <div className="space-y-4">
          {form.items.map((item, index) => (
            <ItemPreview key={index} item={item} />
          ))}
        </div>
      </div>

      {showGasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
              <div>
                <h3 className="text-xl font-bold text-indigo-900">Googleフォーム自動生成スクリプト</h3>
                <p className="text-sm text-indigo-600">Google Apps Scriptを使用してフォームを一瞬で作成できます。</p>
              </div>
              <button onClick={() => setShowGasModal(false)} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                <X size={24} className="text-indigo-900" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold">1</div>
                  <div>
                    <p className="font-bold text-gray-800">スクリプトをコピー</p>
                  </div>
                </div>
                <div className="relative group">
                  <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed max-h-64">
                    {gasCode}
                  </pre>
                  <button 
                    onClick={copyGasToClipboard}
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 text-xs font-bold"
                  >
                    コピー
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold">2</div>
                  <div>
                    <p className="font-bold text-gray-800">Google Apps Scriptを開く</p>
                    <a 
                      href="https://script.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-sm hover:bg-indigo-200"
                    >
                      script.google.com を開く
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setShowGasModal(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};