"don't be backwards compatible with silly vi options
set nocompatible

" fancy colorscheme
:colorscheme southernlights

" status line
" see: https://hackernoon.com/the-last-statusline-for-vim-a613048959b2
set laststatus=2
set statusline=
set statusline+=%2*\ %l
set statusline+=\ %*
set statusline+=%1*\ ‹‹
set statusline+=%1*\ %f\ %*
set statusline+=%1*\ ››
set statusline+=%1*\ %m
set statusline+=%3*\ %F
set statusline+=%=
set statusline+=%3*\ %{fugitive#statusline()}
set statusline+=%3*\ ‹‹
set statusline+=%3*\ %{strftime('%R',getftime(expand('%')))}
set statusline+=%3*\ ::
set statusline+=%3*\ %n
set statusline+=%3*\ ››\ %*


" show line and column numbers
set ruler

" * Search & Replace

" make searches case-insensitive, unless they contain upper-case letters:
set ignorecase
set smartcase

" show the `best match so far' as search strings are typed:
set incsearch

" assume the /g flag on :s substitutions to replace all matches in a line:
set gdefault

" * User Interface

" have syntax highlighting in terminals which can display colours:
if has('syntax') && (&t_Co > 2)
  syntax on
endif

" have fifty lines of command-line (etc) history:
set history=50

" have command-line completion <Tab> (for filenames, help topics, option names)
" first list the available options and complete the longest common part, then
" have further <Tab>s cycle through the possibilities:
set wildmode=list:longest,full

" display the current mode and partially-typed commands in the status line:
set showmode
set showcmd

" have the mouse enabled all the time:
"set mouse=a

" don't have files trying to override this .vimrc:
set nomodeline

" * Text Formatting -- Specific File Formats

" for C-like programming, have automatic indentation:
autocmd FileType c,cpp,slang set cindent

" for actual C (not C++) programming where comments have explicit end
" characters, if starting a new line in the middle of a comment automatically
" insert the comment leader characters:
autocmd FileType c set formatoptions+=ro

" for Perl programming, have things in braces indenting themselves:
autocmd FileType perl set smartindent

" for CSS, also have things in braces indented:
autocmd FileType css set smartindent

" for HTML, generally format text, but if a long line has been created leave it
" alone when editing:
autocmd FileType html set formatoptions+=tl

" for both CSS and HTML, use genuine tab characters for indentation, to make
" files a few bytes smaller:
autocmd FileType html,css set noexpandtab tabstop=2

" in makefiles, don't expand tabs to spaces, since actual tab characters are
" needed, and have indentation at 8 chars to be sure that all indents are tabs
" (despite the mappings later):
autocmd FileType make set noexpandtab shiftwidth=8

" * Keystrokes -- Moving Around

" have the h and l cursor keys wrap between lines (like <Space> and <BkSpc> do
" by default), and ~ covert case over line breaks; also have the cursor keys
" wrap in insert mode:
set whichwrap=h,l,~,[,]

" * Keystrokes -- Insert Mode

" allow <BkSpc> to delete line breaks, beyond the start of the current
" insertion, and over indentations:
set backspace=eol,start,indent

" have <Tab> (and <Shift>+<Tab> where it works) change the level of
" indentation:
inoremap <Tab> <C-T>
inoremap <S-Tab> <C-D>
" for command mode
" nmap <S-Tab> <<
" for insert mode
" imap <S-Tab> <Esc><<i
" [<Ctrl>+V <Tab> still inserts an actual tab character.]

"flag problematic whitespace (trailing and spaces before tabs)
"Note you get the same by doing let c_space_errors=1 but
"this rule really applys to everything.
highlight RedundantSpaces term=standout ctermbg=red guibg=red
match RedundantSpaces /\s\+$\| \+\ze\t/ "\ze sets end of match so only spaces highlighted
"use :set list! to toggle visible whitespace on/off
set listchars=tab:>-,trail:.,extends:>

filetype plugin indent on

" sane defaults
set shiftwidth=4
set smartindent
set autoindent
set tabstop=8
set expandtab
set textwidth=79
set encoding=utf-8

" python
autocmd FileType python let python_highlight_all=1
autocmd FileType python set foldmethod=indent
autocmd FileType python set shiftwidth=4
autocmd FileType python set expandtab

" ruby
autocmd FileType ruby set foldmethod=indent
autocmd FileType ruby set shiftwidth=2

" C
autocmd FileType C set expandtab
autocmd FileType C set foldmethod=indent

" C++
autocmd FileType C++ set expandtab
autocmd FileType C++ set foldmethod=indent

" Puppet
au BufRead,BufNewFile *.pp set shiftwidth=2

" YAML
autocmd FileType ruby set foldmethod=indent
au BufRead,BufNewFile *.yml set shiftwidth=2
au BufRead,BufNewFile *.yaml set shiftwidth=2

au! Syntax tjp          so ~/.vim/syntax/tjp.vim

" tabbar options, don't run in vimdiff'
if &diff
    let g:miniBufExplMapWindowNavVim    = 0
    let g:miniBufExplMapWindowNavArrows = 0
    let g:miniBufExplMapCTabSwitchBufs  = 0
    let g:miniBufExplModSelTarget       = 0
else
    let g:miniBufExplMapWindowNavVim    = 1
    let g:miniBufExplMapWindowNavArrows = 1
    let g:miniBufExplMapCTabSwitchBufs  = 1
    let g:miniBufExplModSelTarget       = 1
endif

" syntastic options
let g:syntastic_always_populate_loc_list = 1
let g:syntastic_auto_loc_list = 1
let g:syntastic_loc_list_height=3
let g:syntastic_echo_current_error  = 1
let g:syntastic_enable_signs        = 1
let g:syntastic_enable_highlighting = 1
let g:syntastic_python_checkers = ['flake8']

let g:ycm_key_list_select_completion = ['<Down>']
let g:ycm_key_list_previous_completion = ['<Up>']
let g:ycm_autoclose_preview_window_after_completion = 1

" See: http://upload.wikimedia.org/wikipedia/en/1/15/Xterm_256color_chart.svg
highlight SyntasticWarning guibg=yellow guifg=black ctermfg=016 ctermbg=226
highlight SyntasticError   guibg=red guifg=white ctermfg=255 ctermbg=160

" NERDTree
nmap <F7> :NERDTreeToggle<CR>

" Tagbar
nmap <F8> :TagbarToggle<CR>

" enable filetype detection:
filetype off

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
if exists(':Plugin')
    Plugin 'Valloric/YouCompleteMe'
    Plugin 'godlygeek/tabular'
    Plugin 'plasticboy/vim-markdown'
    Plugin 'tpope/vim-fugitive'
    Plugin 'vim-syntastic/syntastic'
    Plugin 'scrooloose/nerdtree'
    Plugin 'Xuyuanp/nerdtree-git-plugin'
    Plugin 'flazz/vim-colorschemes'
    Plugin 'majutsushi/tagbar'
endif
" All of your Plugins must be added before the following line
call vundle#end()

filetype plugin indent on

